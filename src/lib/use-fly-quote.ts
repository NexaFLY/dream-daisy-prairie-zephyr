import { useEffect, useState } from "react";
import { getMarket, type MarketQuote } from "@/lib/market";

let cache: MarketQuote | null = null;
let inflight: Promise<MarketQuote | null> | null = null;

function load() {
  inflight ??= getMarket()
    .then((q) => {
      cache = q;
      return q;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useFlyQuote(seed?: MarketQuote | null) {
  const [quote, setQuote] = useState<MarketQuote | null>(seed ?? cache);
  useEffect(() => {
    if (seed) {
      cache = seed;
      setQuote(seed);
      return;
    }
    if (cache) {
      setQuote(cache);
      return;
    }
    void load().then(setQuote);
  }, [seed]);
  return quote;
}
