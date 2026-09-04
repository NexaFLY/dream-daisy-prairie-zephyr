import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";
import { OrgCard } from "@/components/org-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { CATEGORIES, listAssociations, type Category } from "@/lib/associations";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/associations/")({
  loader: () => listAssociations(),
  component: AssociationsPage,
  head: () => ({
    meta: [{ title: "Associations — Nexa FLY" }],
  }),
});

type Region = "all" | "france" | "world";

function AssociationsPage() {
  const { t } = useI18n();
  const orgs = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const href = !isPending && user ? "/espace" : "/login";
  const [region, setRegion] = useState<Region>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((org) => {
      if (region === "france" && org.country !== "France") return false;
      if (region === "world" && org.country === "France") return false;
      if (category !== "all" && org.category !== category) return false;
      if (q) {
        const hay = `${org.name} ${org.tagline} ${org.city} ${org.country} ${org.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orgs, region, category, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [region, category, query]);

  const franceCount = orgs.filter((org) => org.country === "France").length;
  const worldCount = orgs.length - franceCount;

  function go(next: number) {
    setPage(next);
    document.getElementById("org-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <AppFrame>
      <main className="mx-auto max-w-6xl px-5 pt-16 pb-24">
        <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
          {t.org.tag}
        </p>
        <div className="mt-2 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-display font-semibold">{t.org.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{t.org.lead}</p>
            <p className="mt-3 text-xs leading-relaxed text-faint">{t.org.hostedNote}</p>
          </div>
          <a href={href} className={cn(buttonVariants())}>
            {user ? t.org.openSpace : t.org.create}
          </a>
        </div>

        {orgs.length ? (
          <>
            <div className="mt-10 flex flex-wrap gap-2">
              <Chip active={region === "all"} onClick={() => setRegion("all")}>
                {t.org.filterAll} · {orgs.length}
              </Chip>
              <Chip active={region === "france"} onClick={() => setRegion("france")}>
                {t.org.france} · {franceCount}
              </Chip>
              <Chip active={region === "world"} onClick={() => setRegion("world")}>
                {t.org.world} · {worldCount}
              </Chip>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>
                {t.org.category}
              </Chip>
              {CATEGORIES.map((key) => (
                <Chip
                  key={key}
                  active={category === key}
                  onClick={() => setCategory(key)}
                >
                  {t.org.categories[key]}
                </Chip>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.org.searchPh}
              aria-label={t.org.search}
              className="mt-4 h-11 w-full max-w-md rounded-md bg-surface px-4 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.5)]"
            />

            {filtered.length ? (
              <>
                <p id="org-grid" className="mt-8 scroll-mt-24 text-xs text-faint">
                  {t.org.page} {current} / {pageCount}
                  {" · "}
                  {shown.length
                    ? `${(current - 1) * PAGE_SIZE + 1}–${(current - 1) * PAGE_SIZE + shown.length}`
                    : 0}{" "}
                  {t.org.of} {filtered.length}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((org) => (
                    <OrgCard key={org.slug} org={org} />
                  ))}
                </div>
                {pageCount > 1 ? (
                  <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={t.org.page}>
                    <button
                      type="button"
                      disabled={current <= 1}
                      onClick={() => go(current - 1)}
                      className={cn(
                        "h-11 rounded-full px-4 text-xs font-semibold",
                        current <= 1
                          ? "cursor-not-allowed bg-surface text-faint"
                          : "bg-surface text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:text-fg",
                      )}
                    >
                      {t.org.prev}
                    </button>
                    {pagesAround(current, pageCount).map((n, i) =>
                      n === "…" ? (
                        <span key={`gap-${i}`} className="px-1 text-faint">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => go(n)}
                          className={cn(
                            "size-11 rounded-full text-xs font-semibold",
                            n === current
                              ? "bg-primary text-primary-fg"
                              : "bg-surface text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:text-fg",
                          )}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      disabled={current >= pageCount}
                      onClick={() => go(current + 1)}
                      className={cn(
                        "h-11 rounded-full px-4 text-xs font-semibold",
                        current >= pageCount
                          ? "cursor-not-allowed bg-surface text-faint"
                          : "bg-surface text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:text-fg",
                      )}
                    >
                      {t.org.next}
                    </button>
                  </nav>
                ) : null}
              </>
            ) : (
              <p className="mt-12 text-center text-sm text-muted">{t.org.filterEmpty}</p>
            )}
          </>
        ) : (
          <div className="mt-12 rounded-xl bg-surface px-6 py-16 text-center shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
            <p className="font-display text-xl font-semibold">{t.org.empty}</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">{t.org.emptyLead}</p>
            <Button className="mt-6" onClick={() => { window.location.href = href; }}>
              {t.org.create}
            </Button>
          </div>
        )}
      </main>
    </AppFrame>
  );
}

function pagesAround(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (const n of nums) {
    if (out.length && n - (out[out.length - 1] as number) > 1) out.push("…");
    out.push(n);
  }
  return out;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full px-4 text-xs font-semibold transition-[box-shadow,color] duration-150",
        active
          ? "bg-primary text-primary-fg shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
          : "bg-surface text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
