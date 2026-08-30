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

export type MarketQuote = {
  priceUsd: number;
  liquidity: number;
  volume: number;
  change: number;
  pair: string;
  dex: string;
  txns: number;
  pairUrl: string;
  candles: Candle[];
  windows: VolumeWindow[];
};

const USDC = SITE.usdcMint.toLowerCase();
const TTL_MS = 45_000;
const HOUR = 3600;

let memo: { at: number; value: MarketQuote | null } | null = null;

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  quoteToken?: { address?: string; symbol?: string };
};

type RayPool = {
  data?: Array<{
    price?: number;
    tvl?: number;
    day?: { volume?: number };
  }>;
};

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

async function loadCandles(): Promise<Candle[]> {
  const ohlcv = await getJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${SITE.usdcPair}/ohlcv/hour?aggregate=1&limit=72`,
  );
  const fromOhlcv = parseOhlcv(ohlcv);
  if (fromOhlcv.length >= 8) return fromOhlcv;

  const trades = await getJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${SITE.usdcPair}/trades?trade_volume_in_usd_greater_than=0`,
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

async function loadMarket(): Promise<MarketQuote | null> {
  const [dex, candles, ray] = await Promise.all([
    getJson<{ pairs?: DexPair[] }>(
      `https://api.dexscreener.com/latest/dex/tokens/${SITE.mint}`,
    ),
    loadCandles(),
    getJson<RayPool>(`https://api-v3.raydium.io/pools/info/ids?ids=${SITE.usdcPair}`),
  ]);

  const pairs = (dex?.pairs ?? []).filter((p) => p.chainId === "solana" && p.priceUsd);
  const usdcPairs = pairs.filter((p) => p.quoteToken?.address?.toLowerCase() === USDC);
  const bestUsdc =
    [...usdcPairs].sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))[0] ??
    usdcPairs[0];
  const pool = ray?.data?.[0];

  const lastClose = candles.at(-1)?.c;
  const priceUsd = Number(bestUsdc?.priceUsd ?? pool?.price ?? lastClose ?? 0);
  if (!priceUsd && !candles.length) return null;

  const buys = bestUsdc?.txns?.h24?.buys ?? 0;
  const sells = bestUsdc?.txns?.h24?.sells ?? 0;
  const volume =
    bestUsdc?.volume?.h24 ||
    pool?.day?.volume ||
    sumVolume(candles, 24);

  return {
    priceUsd,
    liquidity: bestUsdc?.liquidity?.usd || pool?.tvl || 0,
    volume,
    change: bestUsdc?.priceChange?.h24 || changeFromCandles(candles),
    pair: `FLY / ${bestUsdc?.quoteToken?.symbol ?? "USDC"}`,
    dex: bestUsdc?.dexId ?? "raydium",
    txns: buys + sells,
    pairUrl: bestUsdc?.url ?? SITE.dexscreener,
    candles,
    windows: [
      { key: "m5", value: bestUsdc?.volume?.m5 || sumVolume(candles, 1) / 12 },
      { key: "h1", value: bestUsdc?.volume?.h1 || sumVolume(candles, 1) },
      { key: "h6", value: bestUsdc?.volume?.h6 || sumVolume(candles, 6) },
      { key: "h24", value: bestUsdc?.volume?.h24 || volume },
    ],
  };
}

export const getMarket = createServerFn({ method: "GET" }).handler(async () => {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.value;
  const value = await loadMarket();
  memo = { at: Date.now(), value };
  return value;
});
