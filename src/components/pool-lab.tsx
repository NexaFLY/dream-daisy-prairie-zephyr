import { ArrowUpRight } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import {
  QUOTE_PRESETS,
  createPoolUrl,
  lookupPair,
  type PoolRow,
} from "@/lib/pools";
import { cn, formatUsd } from "@/lib/utils";

const BASES = [
  { symbol: "FLY", mint: SITE.mint },
  { symbol: "nUSD", mint: SITE.nusdMint },
] as const;

export function PoolLab({ pools }: { pools: PoolRow[] }) {
  const { t } = useI18n();
  const c = t.pools;
  const [baseMint, setBaseMint] = useState(SITE.mint);
  const [quote, setQuote] = useState(SITE.usdcMint);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<PoolRow[] | null>(null);
  const [quoteToken, setQuoteToken] = useState<{ symbol: string; mint: string } | null>(
    { symbol: "USDC", mint: SITE.usdcMint },
  );

  const base = BASES.find((b) => b.mint === baseMint) ?? BASES[0];
  const other = quoteToken?.symbol ?? "…";
  const createUrl = quoteToken ? createPoolUrl(base.mint, quoteToken.mint) : SITE.raydiumCreate;
  const best = found?.[0];

  const listed = useMemo(
    () => pools.filter((p) => p.a.mint === SITE.mint || p.b.mint === SITE.mint),
    [pools],
  );

  async function search(value: string) {
    const q = value.trim();
    if (!q) return;
    setBusy(true);
    try {
      const res = await lookupPair({ data: { base: base.mint, quote: q } });
      setQuoteToken(res.token);
      setFound(res.pools);
      if (res.token) setQuote(res.token.mint);
    } catch {
      setFound([]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void search(query || quote);
  }

  return (
    <section id="pools" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="text-center">
        <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{c.tag}</p>
        <h2 className="mt-2 font-display text-display font-semibold">{c.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">{c.lead}</p>
      </div>

      <div className="mt-10 rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">{c.base}</p>
            <div className="mt-2 flex gap-2">
              {BASES.map((b) => (
                <button
                  key={b.mint}
                  type="button"
                  onClick={() => {
                    setBaseMint(b.mint);
                    setFound(null);
                  }}
                  className={cn(
                    "h-11 rounded-md px-4 text-sm font-semibold shadow-[0_0_0_1px_rgba(244,236,223,0.1)]",
                    b.mint === base.mint ? "bg-primary text-primary-fg" : "bg-bg text-fg",
                  )}
                >
                  {b.symbol}
                </button>
              ))}
            </div>
            <p className="mt-5 font-mono text-[0.68rem] tracking-widest text-faint uppercase">
              {c.quote}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUOTE_PRESETS.filter((p) => p.mint !== base.mint).map((p) => (
                <button
                  key={p.mint}
                  type="button"
                  onClick={() => {
                    setQuote(p.mint);
                    setQuery(p.mint);
                    setQuoteToken({ symbol: p.symbol, mint: p.mint });
                    void search(p.mint);
                  }}
                  className={cn(
                    "h-9 rounded-sm px-3 text-xs font-semibold shadow-[0_0_0_1px_rgba(244,236,223,0.1)]",
                    quote === p.mint ? "bg-bg text-primary" : "bg-bg text-muted",
                  )}
                >
                  {p.symbol}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="mt-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.quotePh}
                className="h-11 min-w-0 flex-1 rounded-md bg-bg px-3 font-mono text-xs text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none focus:shadow-[0_0_0_1px_rgba(255,128,0,0.5)]"
              />
              <Button type="submit" disabled={busy}>
                {busy ? "…" : c.lookup}
              </Button>
            </form>
          </div>

          <div className="rounded-lg bg-bg p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-display text-lg font-semibold">
              {base.symbol} / {other}
            </p>
            {best ? (
              <>
                <p className="mt-1 text-sm text-muted">{c.found}</p>
                <p className="mt-4 font-mono text-xs text-faint uppercase">
                  {best.type === "Concentrated" ? c.typeClmm : c.typeStd} ·{" "}
                  {(best.fee * 100).toFixed(2)}% · TVL {formatUsd(best.tvl)}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={best.addUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "primary" }))}
                  >
                    {c.add} <ArrowUpRight className="size-4" />
                  </a>
                  <a
                    href={createUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                  >
                    {c.create} <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted">{found ? c.none : c.hint}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={createUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "primary" }))}
                  >
                    {c.create} <ArrowUpRight className="size-4" />
                  </a>
                  <a
                    href={SITE.raydiumPortfolio}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                  >
                    {c.manage} <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </>
            )}
            <p className="mt-4 text-xs leading-relaxed text-faint">{c.note}</p>
          </div>
        </div>
      </div>

      {listed.length ? (
        <div className="mt-8">
          <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
            {c.existing}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {listed.map((pool) => {
              const pair =
                pool.a.mint === SITE.mint
                  ? `FLY / ${pool.b.symbol}`
                  : `${pool.a.symbol} / FLY`;
              return (
                <a
                  key={pool.id}
                  href={pool.addUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md bg-surface px-3 py-3 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
                >
                  <span>
                    <span className="block text-sm font-semibold">{pair}</span>
                    <span className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                      {pool.type === "Concentrated" ? c.typeClmm : c.typeStd} ·{" "}
                      {(pool.fee * 100).toFixed(2)}%
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-xs tabular-nums">{formatUsd(pool.tvl)}</span>
                    <span className="font-mono text-[0.65rem] text-faint">{formatUsd(pool.volume)}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={SITE.raydiumPools}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {c.raydium} <ArrowUpRight className="size-4" />
        </a>
        <a
          href={SITE.raydiumPortfolio}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {c.manage} <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
