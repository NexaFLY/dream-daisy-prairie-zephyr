import { createServerFn } from "@tanstack/react-start";
import { SITE } from "./constants";

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const QUOTE_PRESETS = [
  { symbol: "USDC", mint: SITE.usdcMint },
  { symbol: "SOL", mint: SITE.solMint },
  { symbol: "nUSD", mint: SITE.nusdMint },
  { symbol: "USDT", mint: SITE.usdtMint },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { symbol: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
] as const;

export type PoolToken = { symbol: string; mint: string };

export type PoolRow = {
  id: string;
  type: string;
  fee: number;
  tvl: number;
  volume: number;
  apr: number;
  a: PoolToken;
  b: PoolToken;
  addUrl: string;
};

type RayMint = { address?: string; symbol?: string };
type RayPool = {
  id?: string;
  type?: string;
  feeRate?: number;
  tvl?: number;
  mintA?: RayMint;
  mintB?: RayMint;
  day?: { volume?: number; apr?: number };
};

function addUrl(type: string, id: string) {
  if (type === "Concentrated") {
    return `https://raydium.io/clmm/create-position/?pool_id=${id}`;
  }
  return `https://raydium.io/liquidity/increase/?pool_id=${id}`;
}

export function createPoolUrl(mintA: string, mintB: string) {
  return `https://raydium.io/clmm/create-pool/?mint1=${mintA}&mint2=${mintB}`;
}

function mapPool(p: RayPool): PoolRow | null {
  if (!p.id || !p.mintA?.address || !p.mintB?.address) return null;
  return {
    id: p.id,
    type: p.type ?? "Standard",
    fee: p.feeRate ?? 0,
    tvl: p.tvl ?? 0,
    volume: p.day?.volume ?? 0,
    apr: p.day?.apr ?? 0,
    a: { symbol: p.mintA.symbol ?? "—", mint: p.mintA.address },
    b: { symbol: p.mintB.symbol ?? "—", mint: p.mintB.address },
    addUrl: addUrl(p.type ?? "", p.id),
  };
}

async function raydiumByMint(mint1: string, mint2?: string): Promise<PoolRow[]> {
  const qs = new URLSearchParams({
    mint1,
    poolType: "all",
    poolSortField: "liquidity",
    sortType: "desc",
    pageSize: "20",
    page: "1",
  });
  if (mint2) qs.set("mint2", mint2);
  try {
    const res = await fetch(`https://api-v3.raydium.io/pools/info/mint?${qs}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { data?: RayPool[] } };
    return (json.data?.data ?? []).map(mapPool).filter((p): p is PoolRow => Boolean(p));
  } catch {
    return [];
  }
}

async function resolveMint(query: string): Promise<PoolToken | null> {
  const q = query.trim();
  if (!q) return null;
  const preset = QUOTE_PRESETS.find(
    (p) => p.mint === q || p.symbol.toLowerCase() === q.toLowerCase(),
  );
  if (preset) return { symbol: preset.symbol, mint: preset.mint };
  try {
    const res = await fetch(
      `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return MINT_RE.test(q) ? { symbol: q.slice(0, 4), mint: q } : null;
    const rows = (await res.json()) as Array<{ id?: string; symbol?: string }>;
    const exact = rows.find((t) => (t.id ?? "") === q || t.symbol?.toLowerCase() === q.toLowerCase());
    const hit = exact ?? rows[0];
    if (hit?.id) return { symbol: hit.symbol ?? hit.id.slice(0, 4), mint: hit.id };
  } catch {
    /* fall through */
  }
  return MINT_RE.test(q) ? { symbol: q.slice(0, 4), mint: q } : null;
}

export const listFlyPools = createServerFn({ method: "GET" }).handler(async () => {
  return raydiumByMint(SITE.mint);
});

export const lookupPair = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { base?: unknown; quote?: unknown };
    const base = String(raw.base ?? SITE.mint).trim();
    const quote = String(raw.quote ?? "").trim();
    if (!MINT_RE.test(base)) throw new Error("base");
    return { base, quote };
  })
  .handler(async ({ data }) => {
    const token = await resolveMint(data.quote);
    if (!token) return { token: null as PoolToken | null, pools: [] as PoolRow[] };
    if (token.mint === data.base) return { token, pools: [] };
    const pools = await raydiumByMint(data.base, token.mint);
    return { token, pools };
  });
