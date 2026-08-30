import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { fieldClass } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [{ title: "Espace association — Nexa FLY" }],
  }),
});

function Login() {
  const { t } = useI18n();
  const c = t.login;
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onProvider(id: string) {
    setError(null);
    setBusy(true);
    try {
      await signIn(id, { callbackURL: "/espace", errorCallbackURL: "/login" });
    } catch {
      setError(c.error);
      setBusy(false);
    }
  }

  async function onEmail(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          callbackURL: "/espace",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/espace",
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/espace";
    } catch {
      setError(c.error);
      setBusy(false);
    }
  }

  if (!isPending && user) return <Navigate to="/espace" />;

  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="grain" aria-hidden />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
          <img src="/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/70 to-bg/20" />
          <div className="relative flex h-full flex-col justify-end p-12">
            <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">{c.tag}</p>
            <h1 className="mt-3 max-w-md font-display text-display font-semibold">{c.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{c.lead}</p>
          </div>
        </section>

        <section className="flex items-center px-5 py-16">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="size-9 rounded-sm outline outline-1 -outline-offset-1 outline-fg/10"
              />
              <span className="font-display text-sm font-semibold tracking-wide">
                NEXA <span className="text-primary">FLY</span>
              </span>
            </Link>
            <p className="mt-10 font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase lg:hidden">
              {c.tag}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold lg:hidden">{c.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{c.hint}</p>

            {authEnabled ? (
              <div className="mt-8 space-y-3">
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    variant="ghost"
                    className="w-full"
                    disabled={busy}
                    onClick={() => onProvider(p.providerId)}
                  >
                    {p.idp === "google" ? c.google : c.x}
                  </Button>
                ))}

                <p className="py-2 text-center font-mono text-[0.65rem] tracking-widest text-faint uppercase">
                  {c.or}
                </p>

                <form
                  onSubmit={onEmail}
                  className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]"
                >
                  {mode === "up" ? (
                    <label className="block text-xs font-semibold text-muted">
                      {c.name}
                      <input
                        required
                        id="org-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={c.namePh}
                        className={fieldClass}
                      />
                    </label>
                  ) : null}
                  <label className={mode === "up" ? "mt-4 block text-xs font-semibold text-muted" : "block text-xs font-semibold text-muted"}>
                    {c.email}
                    <input
                      required
                      id="org-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="mt-4 block text-xs font-semibold text-muted">
                    {c.password}
                    <input
                      required
                      id="org-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  {error ? <p className="mt-3 text-xs text-amber">{error}</p> : null}
                  <Button type="submit" className="mt-5 w-full" disabled={busy}>
                    {busy ? c.submitting : mode === "up" ? c.signUp : c.signIn}
                  </Button>
                  <button
                    type="button"
                    className="mt-3 w-full text-center text-xs text-muted hover:text-fg"
                    onClick={() => {
                      setMode(mode === "up" ? "in" : "up");
                      setError(null);
                    }}
                  >
                    {mode === "up" ? c.switchIn : c.switchUp}
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-8 text-sm text-muted">{c.error}</p>
            )}

            <a href="/" className="mt-8 inline-block text-xs text-faint hover:text-primary">
              ← {c.back}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
