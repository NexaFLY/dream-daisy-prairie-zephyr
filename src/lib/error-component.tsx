import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

function isStaleModule(message: string) {
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
    message,
  );
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const message = error.message || "";
  const stale = isStaleModule(message);

  useEffect(() => {
    if (!stale) return;
    try {
      const key = "nexa-stale-reload";
      const last = Number(sessionStorage.getItem(key) || "0");
      if (Date.now() - last < 5000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, [stale]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <img
        src="/logo.png"
        alt=""
        className="size-12 rounded-md outline outline-1 -outline-offset-1 outline-fg/10"
      />
      <span className="text-primary" aria-hidden>
        <TriangleAlert className="size-8" strokeWidth={2} />
      </span>
      <h1 className="font-display text-xl font-semibold">
        {stale ? "Rechargement en cours…" : "Un instant — on recharge."}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {stale
          ? "Le site a été mis à jour. Si rien ne se passe, rechargez pour retrouver le répertoire, le wallet et le swap."
          : "Réessayez. Si ça bloque encore, revenez à l’accueil."}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg"
          onClick={() => {
            window.location.assign("/");
          }}
        >
          Recharger l’accueil
        </button>
        <a
          href="/associations"
          className="inline-flex h-11 items-center rounded-md px-5 text-sm font-semibold text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.14)]"
        >
          Associations
        </a>
      </div>
    </main>
  );
}
