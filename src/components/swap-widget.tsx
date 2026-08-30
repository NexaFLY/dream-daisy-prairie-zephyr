import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import {
  estimateFromPrice,
  getFlyQuote,
  type FlyQuote,
  type QuoteFrom,
} from "@/lib/swap-quote";
import { fieldClass, cn, formatAmt } from "@/lib/utils";
import { useWallet } from "@/lib/wallet";

export function SwapWidget({
  className,
  initialQuote,
  priceUsd,
}: {
  className?: string;
  initialQuote?: FlyQuote | null;
  priceUsd?: number | null;
}) {
  const { t } = useI18n();
  const { address, openPicker } = useWallet();
  const seeded = initialQuote ?? estimateFromPrice("10", "USDC", priceUsd);
  const [from, setFrom] = useState<QuoteFrom>(seeded?.from ?? "USDC");
  const [amount, setAmount] = useState(seeded?.inAmount ?? "10");
  const [quote, setQuote] = useState<FlyQuote | null>(seeded);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const skipFirst = useRef(Boolean(seeded));

  useEffect(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setQuote(null);
      setStatus("idle");
      return;
    }
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    let cancelled = false;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      getFlyQuote({ data: { amount, from } })
        .then((next) => {
          if (cancelled) return;
          setQuote(next);
          setStatus("idle");
        })
        .catch(() => {
          if (cancelled) return;
          const fallback = estimateFromPrice(amount, from, priceUsd);
          if (fallback) {
            setQuote(fallback);
            setStatus("idle");
            return;
          }
          setStatus("error");
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [amount, from, priceUsd]);

  const jupHref =
    from === "SOL"
      ? `https://jup.ag/swap?sell=${SITE.solMint}&buy=${SITE.mint}`
      : SITE.jupiter;
  const titanHref = from === "SOL" ? SITE.titanSol : SITE.titan;
  const shown = quote ?? estimateFromPrice(amount, from, priceUsd);

  return (
    <div
      className={cn(
        "rounded-lg bg-bg p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] md:p-6",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-3">
        {(["USDC", "SOL"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFrom(item)}
            className={cn(
              "h-11 rounded-md text-sm font-semibold",
              from === item
                ? "bg-primary text-primary-fg"
                : "bg-surface text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:text-fg",
            )}
          >
            {item} → FLY
          </button>
        ))}
      </div>

      <label className="mt-5 block text-xs font-semibold text-muted">
        {t.swap.pay}
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          className={fieldClass}
          suppressHydrationWarning
        />
      </label>

      <div className="mt-4 rounded-md bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
        <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
          {t.swap.receive}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
          {status === "loading" && !shown
            ? t.swap.loading
            : shown
              ? `${formatAmt(shown.outAmount, 2)} FLY`
              : "—"}
        </p>
        {shown ? (
          <p className="mt-2 font-mono text-[0.7rem] text-faint">
            {t.swap.rate} · {shown.route} · 1 {from} ≈{" "}
            {formatAmt(shown.outAmount / Number(shown.inAmount || 1), 2)} FLY
          </p>
        ) : status === "error" ? (
          <p className="mt-2 text-xs text-amber">{t.swap.error}</p>
        ) : null}
      </div>

      {!address ? (
        <Button className="mt-5 w-full" variant="ghost" onClick={openPicker}>
          {t.wallet.connect}
        </Button>
      ) : (
        <p className="mt-4 font-mono text-xs text-muted">
          {t.donate.connected} · {address.slice(0, 4)}…{address.slice(-4)}
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a href={jupHref} target="_blank" rel="noreferrer" className={cn(buttonVariants())}>
          {t.swap.open} <ArrowUpRight className="size-4" />
        </a>
        <a
          href={titanHref}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {t.swap.titan} <ArrowUpRight className="size-4" />
        </a>
      </div>
    </div>
  );
}

export function SwapSection({
  initialQuote,
  priceUsd,
}: {
  initialQuote?: FlyQuote | null;
  priceUsd?: number | null;
}) {
  const { t } = useI18n();
  return (
    <section id="swap" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{t.swap.tag}</p>
          <h2 className="mt-2 font-display text-display font-semibold">{t.swap.title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{t.swap.lead}</p>
          <p className="mt-6 font-mono text-[0.7rem] tracking-widest text-faint uppercase">{t.swap.powered}</p>
        </div>
        <SwapWidget initialQuote={initialQuote} priceUsd={priceUsd} />
      </div>
    </section>
  );
}
