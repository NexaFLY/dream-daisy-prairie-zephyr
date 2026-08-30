import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Copy,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { ConnectButton } from "@/components/wallet-connect";
import { Button, buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import { cn, copyText, shortAddr } from "@/lib/utils";

const NAV = [
  { href: "/associations", key: "associations" as const },
  { href: "/#swap", key: "swap" as const },
  { href: "/#pools", key: "pools" as const },
  { href: "/nusd", key: "nusd" as const },
  { href: "/whitepaper", key: "paper" as const },
];

export function SiteHeader({ onDonate }: { onDonate: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 isolate border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-bg/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className="size-9 rounded-sm outline outline-1 -outline-offset-1 outline-fg/10"
          />
          <span className="font-display text-[0.95rem] font-semibold tracking-wide">
            NEXA <span className="text-primary">FLY</span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.82rem] font-semibold text-muted transition-colors duration-150 hover:text-fg"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LangToggle lang={lang} setLang={setLang} />
          <AuthSlot />
          <ConnectButton />
          <Button className="hidden lg:inline-flex" onClick={onDonate}>
            {t.nav.donate}
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm shadow-[0_0_0_1px_rgba(244,236,223,0.12)] lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg px-5 py-5 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-semibold">NEXA FLY</span>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center text-sm font-semibold text-muted"
              >
                {t.nav[item.key]}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <AuthSlot full />
            <ConnectButton full />
            <Button className="w-full" onClick={() => { setOpen(false); onDonate(); }}>
              {t.nav.donate}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function LangToggle({
  lang,
  setLang,
}: {
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
}) {
  return (
    <div className="flex h-9 items-center rounded-sm bg-surface p-0.5 shadow-[0_0_0_1px_rgba(244,236,223,0.1)]">
      {(["fr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-label={code === "fr" ? "Français" : "English"}
          onClick={() => setLang(code)}
          className={cn(
            "h-8 min-w-9 rounded-[6px] px-2 font-mono text-[0.7rem] font-medium uppercase transition-colors duration-150",
            lang === code ? "bg-fg text-bg" : "text-faint hover:text-fg",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export function DonateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { address, openPicker } = useWallet();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(SITE.wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-bg/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[80] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.1)] focus:outline-none">
          <Dialog.Title className="font-display text-xl font-semibold">
            {t.donate.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            {t.donate.lead}
          </Dialog.Description>

          <div className="mt-5 space-y-3">
            {address ? (
              <p className="rounded-md bg-bg px-3 py-2 font-mono text-xs text-muted">
                {t.donate.connected} · {shortAddr(address, 6, 4)}
              </p>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  openPicker();
                }}
              >
                {t.wallet.connect}
              </Button>
            )}
            <div className="rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
              <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
                {t.donate.onchain}
              </p>
              <p className="mt-1 text-sm text-muted">{t.donate.onchainBody}</p>
              <p className="mt-3 break-all font-mono text-xs text-fg">
                {shortAddr(SITE.wallet, 8, 8)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="subtle" onClick={onCopy}>
                  <Copy className="size-3.5" />
                  {copied ? t.token.copied : t.transparency.copy}
                </Button>
                <a
                  href={SITE.solscanWallet}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Solscan <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>

            <a
              href="/#swap"
              onClick={() => onOpenChange(false)}
              className="block rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-colors duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
            >
              <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
                {t.donate.swap}
              </p>
              <p className="mt-1 text-sm text-muted">{t.donate.swapBody}</p>
            </a>

            <a
              href="/associations"
              onClick={() => onOpenChange(false)}
              className="block rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-colors duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
            >
              <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
                {t.donate.partners}
              </p>
              <p className="mt-1 text-sm text-muted">{t.donate.partnersBody}</p>
            </a>

            <a
              href={`mailto:${SITE.email}`}
              className="block rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-colors duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]"
            >
              <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
                {t.donate.euro}
              </p>
              <p className="mt-1 text-sm text-muted">{t.donate.euroBody}</p>
            </a>
          </div>

          <Dialog.Close asChild>
            <Button variant="ghost" className="mt-5 w-full">
              {t.donate.close}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const socials = [
    { href: SITE.x, label: "X" },
    { href: SITE.telegram, label: "Telegram" },
    { href: SITE.linkedin, label: "LinkedIn" },
    { href: SITE.instagram, label: "Instagram" },
    { href: SITE.facebook, label: "Facebook" },
  ];

  return (
    <footer className="border-t border-border bg-bg-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="size-9 rounded-sm" />
            <span className="font-display font-semibold">
              NEXA <span className="text-primary">FLY</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            {t.footer.blurb}
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-fg hover:text-primary"
          >
            <Mail className="size-4" />
            {SITE.email}
          </a>
        </div>
        <div>
          <p className="font-mono text-[0.7rem] tracking-widest text-faint uppercase">
            {t.footer.legal}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>RNA {SITE.rna}</li>
            <li>SIREN {SITE.siren}</li>
            <li>{SITE.address}</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[0.7rem] tracking-widest text-faint uppercase">
            {t.footer.docs}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="text-muted hover:text-primary" href="/associations">
                {t.nav.associations}
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href="/espace">
                {t.nav.space}
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href="/whitepaper">
                Whitepaper
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href="/nusd">
                nUSD
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href={SITE.registration} target="_blank" rel="noreferrer">
                Registration
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href={SITE.sirenPdf} target="_blank" rel="noreferrer">
                SIREN
              </a>
            </li>
            <li>
              <a className="text-muted hover:text-primary" href={SITE.joafe} target="_blank" rel="noreferrer">
                JOAFE
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-faint">{t.footer.copyright}</p>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted">
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="hover:text-primary">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
