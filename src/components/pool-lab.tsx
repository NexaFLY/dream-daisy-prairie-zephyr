import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import type { PoolRow } from "@/lib/pools";
import { cn, formatUsd } from "@/lib/utils";

function pairLabel(pool: PoolRow) {
  const name = (mint: string, symbol: string) =>
    mint === SITE.mint ? "FLY" : mint === SITE.nusdMint ? "nUSD" : symbol;
  return `${name(pool.a.mint, pool.a.symbol)} / ${name(pool.b.mint, pool.b.symbol)}`;
}

export function PoolLab({ pools }: { pools: PoolRow[] }) {
  const { t } = useI18n();
  const c = t.pools;
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent("Nouveau pool FLY / nUSD")}`;

  return (
    <section id="pools" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="text-center">
        <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{c.tag}</p>
        <h2 className="mt-2 font-display text-display font-semibold">{c.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">{c.lead}</p>
      </div>

      {pools.length ? (
        <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <a
              key={pool.id}
              href={pool.addUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md bg-surface px-3 py-3 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
            >
              <span>
                <span className="block text-sm font-semibold">{pairLabel(pool)}</span>
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
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted">{c.none}</p>
      )}

      <div className="mt-8 rounded-xl bg-surface p-6 text-center shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
        <p className="font-display text-lg font-semibold">{c.newTitle}</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">{c.newLead}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={mail} className={cn(buttonVariants({ variant: "primary" }))}>
            {c.contact}
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
      </div>
    </section>
  );
}
