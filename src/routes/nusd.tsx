import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { ConnectPanel } from "@/components/wallet-connect";
import { Button, buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { cn, copyText } from "@/lib/utils";

export const Route = createFileRoute("/nusd")({
  component: NusdPage,
  head: () => ({
    meta: [{ title: "nUSD — Nexa FLY" }],
  }),
});

function NusdPage() {
  const { t } = useI18n();
  const c = t.nusdPage;
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(SITE.nusdMint);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <AppFrame>
      <main className="mx-auto max-w-6xl px-5 pt-24 pb-24">
        <section className="relative overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
          <img
            src="/glass.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-linear-to-b from-bg/20 via-bg/55 to-bg" />
          <div className="relative grid gap-8 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-10">
            <img
              src="/nusd.png"
              alt="nUSD"
              className="size-28 justify-self-center rounded-full outline outline-1 -outline-offset-1 outline-fg/10 md:size-36"
            />
            <div>
              <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
                {c.eyebrow}
              </p>
              <h1 className="mt-3 font-display text-hero font-semibold">{c.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{c.lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE.jupiterNusd}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "primary" }))}
                >
                  {c.swap} <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={SITE.titanNusd}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                >
                  {c.titan} <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={SITE.solscanNusd}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "subtle" }))}
                >
                  {c.explorer} <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
              {c.backing}
            </p>
            <p className="mt-2 font-display text-xl font-semibold">{c.pegValue}</p>
          </article>
          <article className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">{c.network}</p>
            <p className="mt-2 font-display text-xl font-semibold">Solana</p>
          </article>
          <article className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">{c.peg}</p>
            <p className="mt-2 font-display text-xl font-semibold">USDC 1:1</p>
          </article>
          <article className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(255,128,0,0.28)]">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">{c.mint}</p>
            <p className="mt-2 break-all font-mono text-[0.72rem] leading-relaxed text-amber">
              {SITE.nusdMint}
            </p>
            <Button size="sm" variant="subtle" className="mt-3" onClick={onCopy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? t.token.copied : t.token.copy}
            </Button>
          </article>
        </div>

        <ConnectPanel className="mt-10" />

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
            {c.stepsTag}
          </p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.stepsTitle}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {c.steps.map((step) => (
              <li
                key={step.k}
                className="rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
              >
                <p className="font-mono text-[0.7rem] text-primary">{step.k}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{step.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{c.whyTag}</p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.whyTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{c.why}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {c.uses.map((item) => (
              <article
                key={item.title}
                className="rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
              >
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
            {c.compareTag}
          </p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.compareTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {c.compare.map((item, i) => (
              <article
                key={item.title}
                className={cn(
                  "rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]",
                  i === 1 && "shadow-[0_0_0_1px_rgba(255,128,0,0.28)]",
                )}
              >
                <p className="font-mono text-[0.7rem] text-faint">0{i + 1}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
            {c.specsTag}
          </p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.specsTitle}</h2>
          <div className="mt-8 overflow-hidden rounded-lg bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <dl>
              {c.specs.map((row) => (
                <div
                  key={row.k}
                  className="grid gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-baseline"
                >
                  <dt className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
                    {row.k}
                  </dt>
                  <dd className="text-sm text-fg">{row.v}</dd>
                </div>
              ))}
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline">
                <dt className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
                  {c.mint}
                </dt>
                <dd className="break-all font-mono text-xs text-amber">{SITE.nusdMint}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
            {c.faqTag}
          </p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.faqTitle}</h2>
          <div className="mt-8 grid gap-4">
            {c.faq.map((item) => (
              <article
                key={item.t}
                className="rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
              >
                <h3 className="font-display text-lg font-semibold">{item.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-faint">{c.notice}</p>
      </main>
    </AppFrame>
  );
}
