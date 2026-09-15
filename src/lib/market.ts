import { createServerFn } from "@tanstack/react-start";
import { SITE } from "./constants";

export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type VolumeWindow = {
  key: "m5" | "h1" | "h6" | "h24";
  value: number;
};

export type MarketPool = {
  dex: string;
  quote: string;
  volume: number;
  liquidity: number;
  url: string;
};

export type MarketQuote = {
  priceUsd: number;
  liquidity: number;
  volume: number;
  change: number;
  pair: string;
  dex: string;
  txns: number;
  pairUrl: string;
  solscanUrl: string;
  fdv: number;
  holders: number;
  traders: number;
  mintDisabled: boolean;
  freezeDisabled: boolean;
  supply: number;
  topHolders: number;
  createdAt: number;
  buyVolume: number;
  sellVolume: number;
  candles: Candle[];
  windows: VolumeWindow[];
  pools: MarketPool[];
};

const USDC = SITE.usdcMint.toLowerCase();
const USDT = SITE.usdtMint.toLowerCase();
const TTL_MS = 45_000;
const HOUR = 3600;

const memo = new Map<string, { at: number; value: MarketQuote | null }>();

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  quoteToken?: { address?: string; symbol?: string };
  baseToken?: { address?: string; symbol?: string };
};

function addrOf(token?: { address?: string }) {
  return token?.address?.toLowerCase() ?? "";
}

function otherSymbol(p: DexPair, mint: string) {
  const m = mint.toLowerCase();
  if (addrOf(p.baseToken) === m) return p.quoteToken?.symbol ?? "—";
  if (addrOf(p.quoteToken) === m) return p.baseToken?.symbol ?? "—";
  return p.quoteToken?.symbol ?? p.baseToken?.symbol ?? "—";
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function parseOhlcv(raw: unknown): Candle[] {
  const list =
    (raw as { data?: { attributes?: { ohlcv_list?: unknown[] } } })?.data
      ?.attributes?.ohlcv_list ?? [];
  const candles: Candle[] = [];
  for (const row of list) {
    if (!Array.isArray(row) || row.length < 6) continue;
    const [t, o, h, l, c, v] = row.map(Number);
    if (![t, o, h, l, c, v].every(Number.isFinite)) continue;
    candles.push({ t, o, h, l, c, v });
  }
  candles.sort((a, b) => a.t - b.t);
  return candles;
}

function candlesFromTrades(raw: unknown): Candle[] {
  const rows =
    (raw as {
      data?: Array<{
        attributes?: {
          kind?: string;
          block_timestamp?: string;
          volume_in_usd?: string;
          price_to_in_usd?: string;
          price_from_in_usd?: string;
        };
      }>;
    })?.data ?? [];
  const buckets = new Map<number, Candle>();
  for (const row of rows) {
    const a = row.attributes;
    if (!a?.block_timestamp) continue;
    const ts = Date.parse(a.block_timestamp);
    if (!Number.isFinite(ts)) continue;
    const hour = Math.floor(ts / 1000 / HOUR) * HOUR;
    const price = Number(a.kind === "buy" ? a.price_to_in_usd : a.price_from_in_usd);
    const vol = Number(a.volume_in_usd ?? 0);
    if (!Number.isFinite(price) || price <= 0) continue;
    const prev = buckets.get(hour);
    if (!prev) {
      buckets.set(hour, { t: hour, o: price, h: price, l: price, c: price, v: vol });
    } else {
      prev.h = Math.max(prev.h, price);
      prev.l = Math.min(prev.l, price);
      prev.c = price;
      prev.v += Number.isFinite(vol) ? vol : 0;
    }
  }
  return [...buckets.values()].sort((a, b) => a.t - b.t);
}

async function loadCandles(pool: string): Promise<Candle[]> {
  const ohlcv = await getJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pool}/ohlcv/hour?aggregate=1&limit=72`,
  );
  const fromOhlcv = parseOhlcv(ohlcv);
  if (fromOhlcv.length >= 8) return fromOhlcv;

  const trades = await getJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pool}/trades?trade_volume_in_usd_greater_than=0`,
  );
  return candlesFromTrades(trades);
}

type JupToken = {
  id?: string;
  usdPrice?: number;
  mcap?: number;
  fdv?: number;
  liquidity?: number;
  holderCount?: number;
  circSupply?: number;
  createdAt?: string;
  stats24h?: {
    buyVolume?: number;
    sellVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    priceChange?: number;
  };
  audit?: {
    mintAuthorityDisabled?: boolean;
    freezeAuthorityDisabled?: boolean;
    topHoldersPercentage?: number;
  };
};

async function loadJupToken(mint: string): Promise<JupToken | null> {
  const rows = await getJson<JupToken[]>(
    `https://lite-api.jup.ag/tokens/v2/search?query=${mint}`,
  );
  const hit = (rows ?? []).find((t) => (t.id ?? "").toLowerCase() === mint.toLowerCase());
  return hit ?? null;
}

async function loadTokenMarket(opts: {
  mint: string;
  candlePool: string;
  solscanUrl: string;
}): Promise<MarketQuote | null> {
  const mint = opts.mint.toLowerCase();
  const [dex, jup] = await Promise.all([
    getJson<{ pairs?: DexPair[] }>(
      `https://api.dexscreener.com/latest/dex/tokens/${opts.mint}`,
    ),
    loadJupToken(opts.mint),
  ]);

  const pairs = (dex?.pairs ?? []).filter((p) => p.chainId === "solana" && p.priceUsd);
  if (!pairs.length && !jup) return null;

  const asBase = pairs.filter((p) => addrOf(p.baseToken) === mint);
  const stable = asBase.filter((p) => [USDC, USDT].includes(addrOf(p.quoteToken)));
  const byLiq = [...(asBase.length ? asBase : pairs)].sort(
    (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
  );
  const byVol = [...pairs].sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
  const priced =
    [...stable].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ??
    byLiq[0];

  const lastClose = 0;
  const priceUsd = Number(priced?.priceUsd ?? jup?.usdPrice ?? lastClose ?? 0);
  const jupVol = (jup?.stats24h?.buyVolume ?? 0) + (jup?.stats24h?.sellVolume ?? 0);
  const jupTx = (jup?.stats24h?.numBuys ?? 0) + (jup?.stats24h?.numSells ?? 0);

  const volOf = (key: "m5" | "h1" | "h6" | "h24") =>
    pairs.reduce((s, p) => s + (p.volume?.[key] ?? 0), 0);
  const volume = volOf("h24") || jupVol;
  const liquidity = pairs.reduce((s, p) => s + (p.liquidity?.usd ?? 0), 0) || jup?.liquidity || 0;
  const txns =
    pairs.reduce((s, p) => {
      const t = p.txns?.h24;
      return s + (t?.buys ?? 0) + (t?.sells ?? 0);
    }, 0) || jupTx;
  const dexes = [...new Set(pairs.map((p) => p.dexId).filter(Boolean))] as string[];

  const pools: MarketPool[] = byVol.map((p) => ({
    dex: p.dexId ?? "raydium",
    quote: otherSymbol(p, opts.mint),
    volume: p.volume?.h24 ?? 0,
    liquidity: p.liquidity?.usd ?? 0,
    url: p.url ?? SITE.dexscreener,
  }));

  return {
    priceUsd,
    liquidity,
    volume,
    change: priced?.priceChange?.h24 || jup?.stats24h?.priceChange || 0,
    pair: `${pairs.length} pools`,
    dex: dexes.join(" · ") || "raydium",
    txns,
    pairUrl: priced?.url ?? SITE.dexscreener,
    solscanUrl: opts.solscanUrl,
    fdv: Number(jup?.mcap ?? jup?.fdv ?? priced?.fdv ?? priced?.marketCap ?? 0) || 0,
    holders: jup?.holderCount ?? 0,
    traders: jup?.stats24h?.numTraders ?? 0,
    mintDisabled: Boolean(jup?.audit?.mintAuthorityDisabled),
    freezeDisabled: Boolean(jup?.audit?.freezeAuthorityDisabled),
    supply: Number(jup?.circSupply ?? 0) || 0,
    topHolders: Number(jup?.audit?.topHoldersPercentage ?? 0) || 0,
    createdAt: jup?.createdAt ? Date.parse(jup.createdAt) : 0,
    buyVolume: jup?.stats24h?.buyVolume ?? 0,
    sellVolume: jup?.stats24h?.sellVolume ?? 0,
    candles: [],
    windows: [
      { key: "m5", value: volOf("m5") },
      { key: "h1", value: volOf("h1") },
      { key: "h6", value: volOf("h6") },
      { key: "h24", value: volume },
    ],
    pools,
  };
}

async function cached(key: string, load: () => Promise<MarketQuote | null>) {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = await load();
  memo.set(key, { at: Date.now(), value });
  return value;
}

export const getMarket = createServerFn({ method: "GET" }).handler(async () => {
  return cached("fly", () =>
    loadTokenMarket({
      mint: SITE.mint,
      candlePool: SITE.usdcPair,
      solscanUrl: SITE.solscanToken,
    }),
  );
});

export const getNusdMarket = createServerFn({ method: "GET" }).handler(async () => {
  return cached("nusd", () =>
    loadTokenMarket({
      mint: SITE.nusdMint,
      candlePool: SITE.nusdUsdcPair,
      solscanUrl: SITE.solscanNusd,
    }),
  );
});

export const getNeurMarket = createServerFn({ method: "GET" }).handler(async () => {
  return cached("neur", () =>
    loadTokenMarket({
      mint: SITE.neurMint,
      candlePool: SITE.neurUsdcPair,
      solscanUrl: SITE.solscanNeur,
    }),
  );
});

export const getMarketCandles = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const pool = String((input as { pool?: unknown })?.pool ?? "").trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pool)) throw new Error("pool");
    return { pool };
  })
  .handler(async ({ data }) => loadCandles(data.pool));
