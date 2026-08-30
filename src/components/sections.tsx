import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Landmark,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { PriceVolumeChart } from "@/components/price-chart";
import { OrgCard } from "@/components/org-card";
import { ConnectPanel } from "@/components/wallet-connect";
import { Button, buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import type { Association } from "@/lib/associations";
import type { MarketQuote } from "@/lib/market";
import { cn, copyText, formatPct, formatPrice, formatUsd, shortAddr } from "@/lib/utils";


const VOL_LABEL = {
  m5: "vol5",
  h1: "vol1h",
  h6: "vol6h",
  h24: "vol24h",
} as const;

const VENUE_HREF: Record<string, string> = {
  jupiter: "/#swap",
  titan: SITE.titan,
  orca: SITE.orca,
  raydium: SITE.raydium,
  meteora: SITE.meteora,
  solscanToken: SITE.solscanToken,
  dexscreener: SITE.dexscreener,
};

export function Hero({ onDonate }: { onDonate: () => void }) {
  const { t } = useI18n();
  const supply = "769,795 FLY";

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="h-full w-full object-cover opacity-50"
        />
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero.jpg"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-bg/30 via-bg/55 to-bg" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pt-24 lg:pb-28">
        <div>
          <p className="stagger-in inline-flex items-center gap-2 rounded-full bg-bg/50 px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-amber uppercase shadow-[0_0_0_1px_rgba(244,236,223,0.12)]">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_#ff8000]" />
            {t.hero.eyebrow}
          </p>
          <h1 className="stagger-in mt-6 font-display text-hero font-semibold text-fg">
            {t.hero.titleBefore}{" "}
            <span className="text-primary">{t.hero.titleAccent}</span>
            <br />
            {t.hero.titleAfter}
          </h1>
          <p className="stagger-in mt-5 max-w-lg text-base leading-relaxed text-muted">
            {t.hero.lead}
          </p>
          <div className="stagger-in mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onDonate}>
              {t.hero.cta}
            </Button>
            <a href="/whitepaper" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              {t.hero.secondary}
            </a>
            <a href="/associations" className={cn(buttonVariants({ variant: "subtle", size: "lg" }))}>
              {t.hero.space}
            </a>
          </div>
          <div className="stagger-in mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.7rem] tracking-wide text-faint uppercase">
            <span>{t.hero.proofRna}</span>
            <span>{t.hero.proofWallet}</span>
            <span>{t.hero.proofChain}</span>
          </div>
        </div>

        <div className="stagger-in rounded-xl bg-bg/70 p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.1)] backdrop-blur-md">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] text-faint uppercase">
            {t.snapshot.title}
          </p>
          <dl className="mt-4 divide-y divide-border">
            <SnapRow label={t.snapshot.symbol} value="FLY" accent />
            <SnapRow label={t.snapshot.network} value="Solana" />
            <SnapRow label={t.snapshot.supply} value={supply} />
            <SnapRow label={t.snapshot.status} value={t.snapshot.statusValue} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function SnapRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={cn(
          "font-mono text-sm font-medium tabular-nums",
          accent ? "text-primary" : "text-fg",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function Problem() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Header tag={t.problem.tag} title={t.problem.title} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {t.problem.items.map((item) => (
          <article
            key={item.title}
            className="rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
          >
            <h3 className="font-display text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  const icons = [PenLine, ShieldCheck, Eye];
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="/glass.jpg"
            alt=""
            className="aspect-3/4 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
        </div>
        <div>
          <Header tag={t.how.tag} title={t.how.title} align="left" />
          <ol className="mt-8 space-y-5">
            {t.how.steps.map((step, i) => {
              const Icon = icons[i] ?? Eye;
              return (
                <li key={step.n} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-primary shadow-[0_0_0_1px_rgba(255,128,0,0.25)]">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.7rem] text-faint">{step.n}</p>
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Mission() {
  const { t } = useI18n();
  return (
    <section id="mission" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Header tag={t.mission.tag} title={t.mission.title} />
      <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted">
        {t.mission.body}
      </p>
      <blockquote className="relative mx-auto mt-10 max-w-2xl rounded-xl bg-surface px-8 py-10 text-center shadow-[0_0_0_1px_rgba(255,128,0,0.22)]">
        <p className="font-display text-xl leading-snug text-fg">{t.mission.quote}</p>
      </blockquote>
    </section>
  );
}

export function Market({ quote }: { quote: MarketQuote | null }) {
  const { t } = useI18n();
  const market = quote;

  return (
    <section id="market" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Header tag={t.market.tag} title={t.market.title} lead={t.market.lead} />
      <div className="mt-10 rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] md:p-8">
        {market ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={t.market.price} value={formatPrice(market.priceUsd)} />
            <Stat
              label={t.market.change}
              value={formatPct(market.change)}
              tone={market.change >= 0 ? "up" : "down"}
            />
            <Stat label={t.market.vol} value={formatUsd(market.volume)} />
            <Stat label={t.market.liq} value={formatUsd(market.liquidity)} />
            <Stat label={t.market.txns} value={market.txns ? market.txns.toLocaleString("en-US") : "—"} />
            <Stat label={t.market.fdv} value={market.fdv ? formatUsd(market.fdv) : "—"} />
            <Stat
              label={t.market.holders}
              value={market.holders ? market.holders.toLocaleString("en-US") : "—"}
            />
            <Stat
              label={t.market.traders}
              value={market.traders ? market.traders.toLocaleString("en-US") : "—"}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t.market.error}</p>
        )}
        {market && (market.mintDisabled || market.freezeDisabled) ? (
          <p className="mt-3 font-mono text-[0.7rem] tracking-wide text-faint uppercase">
            {market.mintDisabled ? `${t.market.mint} ${t.market.revoked}` : null}
            {market.mintDisabled && market.freezeDisabled ? " · " : null}
            {market.freezeDisabled ? `${t.market.freeze} ${t.market.revoked}` : null}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
          <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
            {t.market.chart}
          </p>
          {market ? <PriceVolumeChart data={market.candles} /> : null}
          {market ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {market.windows.map((w) => (
                <div key={w.key} className="rounded-sm bg-surface px-2 py-2 text-center">
                  <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                    {t.market[VOL_LABEL[w.key]]}
                  </p>
                  <p className="mt-1 font-mono text-xs tabular-nums">{formatUsd(w.value)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={market?.solscanUrl ?? SITE.solscanToken}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t.market.openSolscan} <ArrowUpRight className="size-4" />
          </a>
          <a
            href={market?.pairUrl ?? SITE.dexscreener}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t.market.openDex} <ArrowUpRight className="size-4" />
          </a>
          <a
            href="/#swap"
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            {t.market.swap}
          </a>
        </div>
        {market?.pools?.length ? (
          <div className="mt-6">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
              {t.market.pools}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {market.pools.map((pool) => (
                <a
                  key={`${pool.dex}-${pool.quote}-${pool.url}`}
                  href={pool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md bg-bg px-3 py-2 text-left shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
                >
                  <span>
                    <span className="block text-sm font-semibold">FLY / {pool.quote}</span>
                    <span className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                      {pool.dex}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-xs tabular-nums">{formatUsd(pool.volume)}</span>
                    <span className="font-mono text-[0.65rem] text-faint">{formatUsd(pool.liquidity)}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
        {market ? (
          <p className="mt-4 font-mono text-xs text-faint uppercase">
            {t.market.pair} · {market.pair} · {market.dex}
          </p>
        ) : null}
      </div>
      <ConnectPanel className="mt-6" />
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-md bg-bg px-4 py-4">
      <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-semibold tabular-nums",
          tone === "up" && "text-amber",
          tone === "down" && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function NusdMarket({
  quote,
  bare = false,
}: {
  quote: MarketQuote | null;
  bare?: boolean;
}) {
  const { t } = useI18n();
  const c = t.nusdMarket;
  const market = quote;

  return (
    <section id="nusd-market" className={cn("mx-auto max-w-6xl scroll-mt-24", bare ? "pt-10 pb-6" : "px-5 pb-20")}>
      {bare ? null : <Header tag={c.tag} title={c.title} lead={c.lead} />}
      <div className={cn("rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] md:p-8", !bare && "mt-10")}>
        {market ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label={t.market.price} value={formatPrice(market.priceUsd)} />
            <Stat
              label={t.market.change}
              value={formatPct(market.change)}
              tone={Math.abs(market.change) < 0.5 ? "up" : market.change >= 0 ? "up" : "down"}
            />
            <Stat label={t.market.vol} value={formatUsd(market.volume)} />
            <Stat label={t.market.liq} value={formatUsd(market.liquidity)} />
            <Stat
              label={t.market.holders}
              value={market.holders ? market.holders.toLocaleString("en-US") : "—"}
            />
            <Stat
              label={t.market.traders}
              value={market.traders ? market.traders.toLocaleString("en-US") : "—"}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t.market.error}</p>
        )}

        <div className="mt-6 overflow-hidden rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
          <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
            {c.chart}
          </p>
          {market ? <PriceVolumeChart data={market.candles} compact peg /> : null}
          {market ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {market.windows.map((w) => (
                <div key={w.key} className="rounded-sm bg-surface px-2 py-2 text-center">
                  <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                    {t.market[VOL_LABEL[w.key]]}
                  </p>
                  <p className="mt-1 font-mono text-xs tabular-nums">{formatUsd(w.value)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={market?.solscanUrl ?? SITE.solscanNusd}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t.market.openSolscan} <ArrowUpRight className="size-4" />
          </a>
          <a
            href={market?.pairUrl ?? SITE.dexscreenerNusd}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t.market.openDex} <ArrowUpRight className="size-4" />
          </a>
          <a
            href={SITE.jupiterNusd}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            {c.swap} <ArrowUpRight className="size-4" />
          </a>
        </div>

        {market?.pools?.length ? (
          <div className="mt-6">
            <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">
              {t.market.pools}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {market.pools.map((pool) => (
                <a
                  key={`${pool.dex}-${pool.quote}-${pool.url}`}
                  href={pool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md bg-bg px-3 py-2 text-left shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
                >
                  <span>
                    <span className="block text-sm font-semibold">nUSD / {pool.quote}</span>
                    <span className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                      {pool.dex}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-xs tabular-nums">{formatUsd(pool.volume)}</span>
                    <span className="font-mono text-[0.65rem] text-faint">{formatUsd(pool.liquidity)}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
        {market ? (
          <p className="mt-4 font-mono text-xs text-faint uppercase">
            {t.market.pair} · {market.pair} · {market.dex}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function Token() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(SITE.mint);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section id="token" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Header tag={t.token.tag} title={t.token.title} lead={t.token.lead} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCard label={t.token.name} value="Nexa" />
        <MetaCard label={t.token.symbol} value="FLY" />
        <MetaCard label={t.token.network} value="Solana" />
        <MetaCard label={t.token.contract} value={shortAddr(SITE.mint, 4, 4)} />
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <p className="break-all font-mono text-xs text-muted">{SITE.mint}</p>
        <Button size="sm" variant="subtle" onClick={onCopy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t.token.copied : t.token.copy}
        </Button>
      </div>

      <p className="mt-10 font-mono text-[0.7rem] tracking-widest text-primary uppercase">
        {t.token.get}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {t.token.venues.map((venue) => {
          const internal = VENUE_HREF[venue.key]?.startsWith("/");
          return (
          <a
            key={venue.key}
            href={VENUE_HREF[venue.key]}
            target={internal ? undefined : "_blank"}
            rel={internal ? undefined : "noreferrer"}
            className="flex items-center justify-between rounded-md bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
          >
            <span>
              <span className="block text-sm font-semibold">{venue.label}</span>
              <span className="text-xs text-faint">{venue.hint}</span>
            </span>
            <ArrowUpRight className="size-4 text-muted" />
          </a>
          );
        })}
      </div>
    </section>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
      <p className="font-mono text-[0.68rem] tracking-widest text-faint uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold">{value}</p>
    </article>
  );
}

export function Transparency({ onDonate }: { onDonate: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(SITE.wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section id="transparency" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Header
        tag={t.transparency.tag}
        title={t.transparency.title}
        lead={t.transparency.lead}
      />
      <div className="mt-8 rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(255,128,0,0.22)] md:p-8">
        <p className="break-all font-mono text-sm leading-relaxed text-fg md:text-base">
          {SITE.wallet}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={onCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? t.token.copied : t.transparency.copy}
          </Button>
          <a
            href={SITE.solscanWallet}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t.transparency.view} <ArrowUpRight className="size-4" />
          </a>
          <Button variant="subtle" onClick={onDonate}>
            {t.transparency.donateHere}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Header tag={t.projects.tag} title={t.projects.title} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {t.projects.items.map((item, i) => (
          <article
            key={item.title}
            className={cn(
              "rounded-lg bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]",
              i === 1 && "md:translate-y-4",
            )}
          >
            <p className="font-mono text-[0.7rem] text-faint">0{i + 1}</p>
            <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Network({ orgs }: { orgs: Association[] }) {
  const { t } = useI18n();
  const headlines = [
    "nexa-fly",
    "croix-rouge-francaise",
    "restos-du-coeur",
    "msf-france",
    "unicef-france",
    "cicr",
  ];
  const picked = headlines
    .map((slug) => orgs.find((org) => org.slug === slug))
    .filter((org): org is Association => Boolean(org));
  const shown = (picked.length >= 6 ? picked : [...picked, ...orgs.filter((org) => !headlines.includes(org.slug))]).slice(0, 6);
  return (
    <section id="associations" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Header tag={t.org.tag} title={t.org.title} lead={t.org.lead} />
      {orgs.length ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((org) => (
            <OrgCard key={org.slug} org={org} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted">{t.org.emptyLead}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/associations" className={cn(buttonVariants({ variant: "ghost" }))}>
          {t.org.all}
        </a>
        <a href="/login" className={cn(buttonVariants())}>
          {t.org.create}
        </a>
      </div>
    </section>
  );
}

export function Team() {
  const { t } = useI18n();
  const founders = ["Karen Grigoryan", "Albert Grigoryan"];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Header tag={t.team.tag} title={t.team.title} lead={t.team.body} />
      <div className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
        {founders.map((name) => (
          <article
            key={name}
            className="rounded-lg bg-surface px-5 py-6 text-center shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-bg font-display text-sm text-primary shadow-[0_0_0_1px_rgba(255,128,0,0.3)]">
              {name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <p className="mt-3 font-display font-semibold">{name}</p>
            <p className="mt-1 text-xs text-faint">{t.team.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <Header tag={t.faq.tag} title={t.faq.title} />
      <div className="mt-8 divide-y divide-border rounded-xl bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
        {t.faq.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-faint transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <p className="overflow-hidden px-5 text-sm leading-relaxed text-muted">
                  <span className="block pb-4">{item.a}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Contact() {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject =
      lang === "fr" ? `Contact Nexa FLY — ${name}` : `Nexa FLY contact — ${name}`;
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Header tag={t.contact.tag} title={t.contact.title} lead={t.contact.lead} align="left" />
          <div className="mt-8 space-y-3 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              {SITE.address}
            </p>
            <p className="font-mono text-xs">RNA {SITE.rna} · SIREN {SITE.siren}</p>
          </div>
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
        >
          <label className="block text-xs font-semibold text-muted">
            {t.contact.name}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.contact.placeholderName}
              suppressHydrationWarning
              className="mt-2 h-11 w-full rounded-md bg-bg px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold text-muted">
            {t.contact.email}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.contact.placeholderEmail}
              suppressHydrationWarning
              className="mt-2 h-11 w-full rounded-md bg-bg px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold text-muted">
            {t.contact.message}
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.contact.placeholderMessage}
              suppressHydrationWarning
              className="mt-2 w-full rounded-md bg-bg px-3 py-3 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]"
            />
          </label>
          <Button type="submit" className="mt-5 w-full">
            {t.contact.send}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Header({
  tag,
  title,
  lead,
  align = "center",
}: {
  tag: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{tag}</p>
      <h2 className="mt-2 font-display text-display font-semibold">{title}</h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
