import { ArrowUpRight, MapPin } from "lucide-react";
import type { Association } from "@/lib/associations";
import { useI18n } from "@/lib/i18n";
import { cn, initials } from "@/lib/utils";

function markSrc(org: Pick<Association, "name" | "logoUrl" | "featured" | "slug">) {
  if (org.logoUrl) return org.logoUrl;
  if (org.featured) return "/logo.png";
  return "";
}

export function OrgMark({
  org,
  size = "md",
}: {
  org: Pick<Association, "name" | "logoUrl" | "featured" | "slug">;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "size-14" : "size-11";
  const src = markSrc(org);
  if (src) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-fg shadow-[0_0_0_1px_rgba(244,236,223,0.12)]",
          box,
        )}
      >
        <img src={src} alt="" className="size-full object-contain" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-bg font-display text-primary shadow-[0_0_0_1px_rgba(255,128,0,0.3)]",
        box,
        size === "lg" ? "text-lg" : "text-sm",
      )}
    >
      {initials(org.name)}
    </span>
  );
}

export function OrgCard({ org }: { org: Association }) {
  const { t } = useI18n();
  const cat = t.org.categories[org.category];
  const src = markSrc(org);
  const onDark = org.featured;

  return (
    <a
      href={`/associations/${org.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
    >
      <div
        className={cn(
          "relative flex h-40 items-center justify-center overflow-hidden",
          onDark ? "bg-bg" : "bg-fg",
        )}
      >
        {src ? (
          <img
            src={src}
            alt={org.name}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <span className="font-display text-3xl text-primary">{initials(org.name)}</span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-bg/90 px-2.5 py-1 font-mono text-[0.65rem] tracking-widest text-faint uppercase">
          {org.featured ? t.org.featured : org.hosted ? t.org.hosted : cat}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold">{org.name}</h3>
        {org.tagline ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{org.tagline}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-faint">
          <span className="inline-flex items-center gap-1.5">
            {org.city ? (
              <>
                <MapPin className="size-3.5" />
                {org.city}
                {org.country && org.country !== "France" ? ` · ${org.country}` : ""}
              </>
            ) : (
              cat
            )}
          </span>
          <span>
            {org.giftCount} {org.giftCount === 1 ? t.org.gift : t.org.gifts}
          </span>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          {t.org.publicPage}
          <ArrowUpRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </p>
      </div>
    </a>
  );
}
