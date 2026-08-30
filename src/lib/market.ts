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

function sumVolume(candles: Candle[], hours: number) {
  const end = candles.at(-1)?.t ?? 0;
  const start = end - hours * HOUR;
  return candles.filter((c) => c.t >= start).reduce((s, c) => s + c.v, 0);
}

function changeFromCandles(candles: Candle[]) {
  const last = candles.at(-1);
  if (!last) return 0;
  const then = candles.find((c) => c.t >= last.t - 24 * HOUR) ?? candles[0];
  if (!then || then.o <= 0) return 0;
  return ((last.c - then.o) / then.o) * 100;
}

async function loadTokenMarket(opts: {
  mint: string;
  candlePool: string;
  solscanUrl: string;
}): Promise<MarketQuote | null> {
  const mint = opts.mint.toLowerCase();
  const [dex, candles] = await Promise.all([
    getJson<{ pairs?: DexPair[] }>(
      `https://api.dexscreener.com/latest/dex/tokens/${opts.mint}`,
    ),
    loadCandles(opts.candlePool),
  ]);

  const pairs = (dex?.pairs ?? []).filter((p) => p.chainId === "solana" && p.priceUsd);
  if (!pairs.length && !candles.length) return null;

  const asBase = pairs.filter((p) => addrOf(p.baseToken) === mint);
  const stable = asBase.filter((p) => [USDC, USDT].includes(addrOf(p.quoteToken)));
  const byLiq = [...(asBase.length ? asBase : pairs)].sort(
    (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
  );
  const byVol = [...pairs].sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
  const priced =
    [...stable].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ??
    byLiq[0];

  const lastClose = candles.at(-1)?.c;
  const priceUsd = Number(priced?.priceUsd ?? lastClose ?? 0);

  const volOf = (key: "m5" | "h1" | "h6" | "h24") =>
    pairs.reduce((s, p) => s + (p.volume?.[key] ?? 0), 0);
  const volume = volOf("h24") || sumVolume(candles, 24);
  const liquidity = pairs.reduce((s, p) => s + (p.liquidity?.usd ?? 0), 0);
  const txns = pairs.reduce((s, p) => {
    const t = p.txns?.h24;
    return s + (t?.buys ?? 0) + (t?.sells ?? 0);
  }, 0);
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
    change: priced?.priceChange?.h24 || changeFromCandles(candles),
    pair: `${pairs.length} pools`,
    dex: dexes.join(" · ") || "raydium",
    txns,
    pairUrl: priced?.url ?? SITE.dexscreener,
    solscanUrl: opts.solscanUrl,
    fdv: Number(priced?.fdv ?? priced?.marketCap ?? 0) || 0,
    candles,
    windows: [
      { key: "m5", value: volOf("m5") || sumVolume(candles, 1) / 12 },
      { key: "h1", value: volOf("h1") || sumVolume(candles, 1) },
      { key: "h6", value: volOf("h6") || sumVolume(candles, 6) },
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
