import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/lib/constants";

export type QuoteFrom = "USDC" | "SOL";

export type FlyQuote = {
  from: QuoteFrom;
  inAmount: string;
  outAmount: number;
  outRaw: string;
  impact: number;
  route: string;
};

const AMOUNT_RE = /^\d+(?:\.\d{1,9})?$/;
const MEMO_MS = 20_000;

let memo: { key: string; at: number; value: FlyQuote } | null = null;

export function estimateFromPrice(
  amount: string,
  from: QuoteFrom,
  priceUsd: number | null | undefined,
): FlyQuote | null {
  if (from !== "USDC" || !priceUsd || priceUsd <= 0) return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return {
    from,
    inAmount: amount,
    outAmount: n / priceUsd,
    outRaw: "0",
    impact: 0,
    route: "Raydium",
  };
}

async function quoteFromJupiter(amount: string, from: QuoteFrom): Promise<FlyQuote> {
  const inputMint = from === "SOL" ? SITE.solMint : SITE.usdcMint;
  const decimals = from === "SOL" ? 9 : 6;
  const rawIn = Math.round(Number(amount) * 10 ** decimals);
  const url =
    `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}` +
    `&outputMint=${SITE.mint}&amount=${rawIn}&slippageBps=50`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("quote");
  const json = (await res.json()) as {
    outAmount?: string;
    priceImpactPct?: string;
    routePlan?: Array<{ swapInfo?: { label?: string } }>;
  };
  const outRaw = json.outAmount ?? "0";
  const hop = json.routePlan?.[0]?.swapInfo?.label ?? "Jupiter";
  return {
    from,
    inAmount: amount,
    outAmount: Number(outRaw) / 1_000_000,
    outRaw,
    impact: Number(json.priceImpactPct ?? 0),
    route: hop,
  };
}

async function quoteFromDex(amount: string, from: QuoteFrom): Promise<FlyQuote> {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${SITE.mint}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("dex");
  const json = (await res.json()) as {
    pairs?: Array<{ chainId?: string; priceUsd?: string; dexId?: string }>;
  };
  const pair = (json.pairs ?? []).find((p) => p.chainId === "solana" && Number(p.priceUsd) > 0);
  const priceUsd = Number(pair?.priceUsd ?? 0);
  const estimated = estimateFromPrice(amount, from, priceUsd);
  if (!estimated) throw new Error("dex");
  estimated.route = pair?.dexId ?? "Raydium";
  return estimated;
}

export async function fetchFlyQuote(amount: string, from: QuoteFrom): Promise<FlyQuote> {
  const key = `${from}:${amount}`;
  if (memo && memo.key === key && Date.now() - memo.at < MEMO_MS) return memo.value;

  try {
    const next = await quoteFromJupiter(amount, from);
    memo = { key, at: Date.now(), value: next };
    return next;
  } catch {
    if (memo && memo.value.from === from) {
      const scale = Number(amount) / Number(memo.value.inAmount || 1);
      if (Number.isFinite(scale) && scale > 0) {
        return {
          ...memo.value,
          inAmount: amount,
          outAmount: memo.value.outAmount * scale,
        };
      }
    }
    const next = await quoteFromDex(amount, from);
    memo = { key, at: Date.now(), value: next };
    return next;
  }
}

export const getFlyQuote = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { amount?: unknown; from?: unknown };
    const from: QuoteFrom = raw.from === "SOL" ? "SOL" : "USDC";
    const amount = String(raw.amount ?? "").trim();
    if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) throw new Error("amount");
    return { amount, from };
  })
  .handler(async ({ data }): Promise<FlyQuote> => fetchFlyQuote(data.amount, data.from));
