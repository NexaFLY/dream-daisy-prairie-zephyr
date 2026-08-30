import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
import { ConnectPanel } from "@/components/wallet-connect";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/whitepaper")({
  component: WhitepaperPage,
  head: () => ({
    meta: [{ title: "Whitepaper — Nexa FLY" }],
  }),
});

function WhitepaperPage() {
  const { t } = useI18n();
  const c = t.paperPage;

  return (
    <AppFrame>
      <main className="mx-auto max-w-6xl px-5 pt-24 pb-24">
        <section className="relative overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
          <img
            src="/hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-linear-to-b from-bg/30 via-bg/65 to-bg" />
          <div className="relative p-6 md:p-10">
            <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
              {c.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-hero font-semibold">{c.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">{c.lead}</p>
            <a
              href={SITE.whitepaperPdf}
              download="nexa_whitepaper.pdf"
              className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
            >
              {c.download} <ArrowUpRight className="size-4" />
            </a>
          </div>
        </section>

        <p className="mt-16 font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
          {c.statsTag}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.stats.map((item) => (
            <article
              key={item.k}
              className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
            >
              <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
                {item.k}
              </p>
              <p className="mt-2 font-display text-xl font-semibold">{item.v}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {c.sections.map((section) => (
            <article
              key={section.k}
              className="rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
            >
              <p className="font-mono text-[0.7rem] text-faint">{section.k}</p>
              <h2 className="mt-1 font-display text-xl font-semibold">{section.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{section.b}</p>
            </article>
          ))}
        </div>

        <section className="mt-16">
          <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
            {c.roadmapTag}
          </p>
          <h2 className="mt-2 font-display text-display font-semibold">{c.roadmapTitle}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {c.roadmap.map((step, i) => (
              <li
                key={step.k}
                className={cn(
                  "rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]",
                  i === 1 && "md:translate-y-3",
                  i === 3 && "md:translate-y-3",
                )}
              >
                <p className="font-mono text-[0.7rem] text-primary">{step.k}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{step.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.b}</p>
              </li>
            ))}
          </ol>
        </section>

        <ConnectPanel className="mt-16" />

        <div className="mt-10 rounded-xl bg-surface p-6 text-sm text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
          <p>{SITE.email}</p>
          <p className="mt-1">
            <a href={SITE.x} className="text-primary" target="_blank" rel="noreferrer">
              x.com/NexaFly
            </a>
          </p>
        </div>
      </main>
    </AppFrame>
  );
}
