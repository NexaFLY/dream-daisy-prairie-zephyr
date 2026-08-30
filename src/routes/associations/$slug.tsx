import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Globe, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { GiftLedger } from "@/components/gift-ledger";
import { GiftPanel } from "@/components/gift-panel";
import { OrgMark } from "@/components/org-card";
import { buttonVariants } from "@/components/ui/button";
import { getAssociation, type Gift } from "@/lib/associations";
import { getHoldings, type Holdings } from "@/lib/holdings";
import { useI18n } from "@/lib/i18n";
import { cn, formatAmt, formatWhen } from "@/lib/utils";

export const Route = createFileRoute("/associations/$slug")({
  loader: async ({ params }) => getAssociation({ data: { slug: params.slug } }),
  component: AssociationPage,
  head: ({ loaderData, params }) => ({
    meta: [{ title: `${loaderData?.name ?? params.slug} — Nexa FLY` }],
  }),
});

function AssociationPage() {
  const org = Route.useLoaderData();
  const { t } = useI18n();

  if (!org) {
    return (
      <AppFrame>
        <main className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-display font-semibold">{t.org.empty}</h1>
          <a href="/associations" className={cn(buttonVariants({ variant: "ghost" }), "mt-6")}>
            {t.org.all}
          </a>
        </main>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <AssociationBody />
    </AppFrame>
  );
}

function AssociationBody() {
  const org = Route.useLoaderData();
  const { t, lang } = useI18n();
  const [gifts, setGifts] = useState<Gift[]>(org?.gifts ?? []);
  const [holdings, setHoldings] = useState<Holdings | null>(null);

  useEffect(() => {
    if (!org?.walletAddress || org.hosted) return;
    getHoldings({ data: { address: org.walletAddress } })
      .then(setHoldings)
      .catch(() => setHoldings(null));
  }, [org?.walletAddress, org?.hosted]);

  if (!org) return null;

  function onRecorded(gift: Gift) {
    setGifts((prev) => [gift, ...prev]);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pt-16 pb-24">
      <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
        {org.featured ? t.org.featured : org.hosted ? t.org.hosted : t.org.categories[org.category]}
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <OrgMark org={org} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-display font-semibold">{org.name}</h1>
            {org.tagline ? (
              <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{org.tagline}</p>
            ) : null}
          </div>
        </div>
        <a href="/associations" className={cn(buttonVariants({ variant: "ghost" }), "shrink-0 self-start")}>
          {t.org.all}
        </a>
      </div>

      {org.hosted ? (
        <p className="mt-6 max-w-2xl rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-muted shadow-[0_0_0_1px_rgba(255,180,84,0.22)]">
          {t.org.hostedLead}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted">
        {org.city ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            {org.city}
            {org.country ? `, ${org.country}` : ""}
          </span>
        ) : null}
        {org.rna ? (
          <span className="font-mono text-xs">
            {t.org.rna} {org.rna}
          </span>
        ) : null}
        <span>
          {t.org.since} {formatWhen(org.createdAt, lang)}
        </span>
        {org.website ? (
          <a
            href={org.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <Globe className="size-4" />
            {t.org.website}
            <ArrowUpRight className="size-3.5" />
          </a>
        ) : null}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {org.description ? (
            <p className="text-base leading-relaxed text-muted whitespace-pre-wrap">
              {org.description}
            </p>
          ) : null}

          {org.walletAddress && holdings && !org.hosted ? (
            <div className="mt-8">
              <p className="font-mono text-[0.7rem] tracking-widest text-faint uppercase">
                {t.org.holdings}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Balance k="SOL" v={holdings.sol} />
                <Balance k="USDC" v={holdings.usdc} />
                <Balance k="FLY" v={holdings.fly} />
                <Balance k="nUSD" v={holdings.nusd} />
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <p className="mb-3 font-mono text-[0.7rem] tracking-widest text-faint uppercase">
              {t.org.ledger}
            </p>
            <GiftLedger gifts={gifts} empty={t.org.ledgerEmpty} />
          </div>
        </div>

        {org.walletAddress ? (
          <GiftPanel
            slug={org.slug}
            wallet={org.walletAddress}
            hosted={org.hosted}
            onRecorded={onRecorded}
          />
        ) : (
          <div className="rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-display text-lg font-semibold">{t.org.noWallet}</p>
            <p className="mt-2 text-sm text-muted">{t.org.noWalletBody}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Balance({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-3 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
      <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">{k}</p>
      <p className="mt-1 font-display text-sm font-semibold">{formatAmt(v, 2)}</p>
    </div>
  );
}
