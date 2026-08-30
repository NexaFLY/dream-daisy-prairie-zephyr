import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, Wallet } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppFrame } from "@/components/app-frame";
import { GiftLedger } from "@/components/gift-ledger";
import { Button, buttonVariants } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  CATEGORIES,
  getMySpace,
  listMyGifts,
  saveMySpace,
  saveMyWallet,
  slugify,
  type Association,
  type Category,
  type Gift,
} from "@/lib/associations";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import { areaClass, cn, fieldClass, shortAddr } from "@/lib/utils";

export const Route = createFileRoute("/espace")({
  component: EspacePage,
  head: () => ({
    meta: [{ title: "Espace association — Nexa FLY" }],
  }),
});

function EspacePage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <AppFrame>
        <main className="mx-auto max-w-6xl px-5 py-24">
          <div className="h-40 animate-pulse rounded-xl bg-surface" />
        </main>
      </AppFrame>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <AppFrame>
      <EspaceBody />
    </AppFrame>
  );
}

function EspaceBody() {
  const { t } = useI18n();
  const [space, setSpace] = useState<Association | null | undefined>(undefined);
  const [gifts, setGifts] = useState<Gift[]>([]);

  useEffect(() => {
    let live = true;
    getMySpace()
      .then((row) => {
        if (live) setSpace(row);
      })
      .catch(() => {
        if (live) setSpace(null);
      });
    listMyGifts()
      .then((rows) => {
        if (live) setGifts(rows);
      })
      .catch(() => {
        if (live) setGifts([]);
      });
    return () => {
      live = false;
    };
  }, []);

  if (space === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-24">
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pt-16 pb-24">
      <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
        {t.org.tag}
      </p>
      <h1 className="mt-2 font-display text-display font-semibold">
        {space ? t.org.dashTitle : t.org.onboardTitle}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        {space ? t.org.dashLead : t.org.onboardLead}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <SpaceForm
          key={space?.id ?? "new"}
          space={space}
          onSaved={(row) => {
            setSpace(row);
            void listMyGifts()
              .then(setGifts)
              .catch(() => setGifts([]));
          }}
        />
        <div className="space-y-6">
          <WalletCard space={space} onSaved={setSpace} />
          {space ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[0.7rem] tracking-widest text-faint uppercase">
                  {t.org.ledger}
                </p>
                <a
                  href={`/associations/${space.slug}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  {t.org.publicPage} <ArrowUpRight className="size-3.5" />
                </a>
              </div>
              <GiftLedger gifts={gifts} empty={t.org.ledgerEmpty} />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function SpaceForm({
  space,
  onSaved,
}: {
  space: Association | null;
  onSaved: (space: Association) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(space?.name ?? "");
  const [slug, setSlug] = useState(space?.slug ?? "");
  const [tagline, setTagline] = useState(space?.tagline ?? "");
  const [description, setDescription] = useState(space?.description ?? "");
  const [city, setCity] = useState(space?.city ?? "");
  const [website, setWebsite] = useState(space?.website ?? "");
  const [rna, setRna] = useState(space?.rna ?? "");
  const [category, setCategory] = useState<Category>(space?.category ?? "solidarity");
  const [published, setPublished] = useState(space?.published ?? true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const next = await saveMySpace({
        data: { name, slug, tagline, description, city, website, rna, category, published },
      });
      onSaved(next);
      setSlug(next.slug);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("slug")) setError(t.org.errSlug);
      else if (msg.includes("name")) setError(t.org.errName);
      else setError(t.org.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
    >
      <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
        {t.org.profile}
      </p>
      <label className="mt-5 block text-xs font-semibold text-muted">
        {t.org.name}
        <input
          required
          id="space-name"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            if (!space) setSlug(slugify(value));
          }}
          placeholder={t.org.namePh}
          className={fieldClass}
        />
      </label>
      <label className="mt-4 block text-xs font-semibold text-muted">
        {t.org.slug}
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          className={cn(fieldClass, "font-mono")}
        />
        <span className="mt-1 block font-mono text-[0.7rem] text-faint">
          /associations/{slug || "…"}
        </span>
      </label>
      <label className="mt-4 block text-xs font-semibold text-muted">
        {t.org.tagline}
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder={t.org.taglinePh}
          className={fieldClass}
        />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          {t.org.city}
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.org.cityPh}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {t.org.category}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={fieldClass}
          >
            {CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {t.org.categories[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          {t.org.website}
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder={t.org.websitePh}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {t.org.rna}
          <input
            value={rna}
            onChange={(e) => setRna(e.target.value)}
            placeholder={t.org.rnaPh}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="mt-4 block text-xs font-semibold text-muted">
        {t.org.description}
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.org.descriptionPh}
          className={areaClass}
        />
      </label>
      <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="size-4 accent-primary"
        />
        {t.org.published}
      </label>
      {error ? <p className="mt-3 text-xs text-amber">{error}</p> : null}
      {saved ? <p className="mt-3 text-xs text-primary">{t.org.saved}</p> : null}
      <Button type="submit" className="mt-5 w-full" disabled={busy}>
        {busy ? t.login.submitting : t.org.save}
      </Button>
    </form>
  );
}

function WalletCard({
  space,
  onSaved,
}: {
  space: Association | null;
  onSaved: (space: Association) => void;
}) {
  const { t } = useI18n();
  const { address, openPicker } = useWallet();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLink() {
    if (!address || !space) return;
    setError(null);
    setBusy(true);
    try {
      const next = await saveMyWallet({ data: { address } });
      onSaved(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("taken") ? t.org.errWalletTaken : t.org.errWallet);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
      <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
        {t.org.receive}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.org.receiveLead}</p>
      {space?.walletAddress ? (
        <p className="mt-4 break-all font-mono text-xs text-fg">{space.walletAddress}</p>
      ) : (
        <p className="mt-4 text-sm text-amber">{space ? t.org.needWallet : t.org.noWalletBody}</p>
      )}
      {!space ? null : !address ? (
        <Button className="mt-5 w-full" variant="ghost" onClick={openPicker}>
          <Wallet className="size-4" />
          {t.org.connectWallet}
        </Button>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="font-mono text-xs text-muted">
            {shortAddr(address, 6, 4)}
          </p>
          <Button className="w-full" onClick={onLink} disabled={busy || address === space.walletAddress}>
            {saved ? <Check className="size-4" /> : null}
            {saved ? t.org.walletSaved : t.org.useWallet}
          </Button>
        </div>
      )}
      {error ? <p className="mt-3 text-xs text-amber">{error}</p> : null}
    </div>
  );
}
