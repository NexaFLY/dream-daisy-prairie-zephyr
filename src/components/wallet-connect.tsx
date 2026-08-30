import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpRight, Check, Copy, LogOut, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import { WALLET_CATALOG, isMobileUa, openWalletInstallOrApp } from "@/lib/wallet-standard";
import { cn, copyText, formatAmt, shortAddr } from "@/lib/utils";

function WalletMark({
  name,
  icon,
  mark,
}: {
  name: string;
  icon?: string | null;
  mark?: string;
}) {
  if (icon) {
    return (
      <img src={icon} alt="" className="size-9 rounded-sm object-cover" />
    );
  }
  const letter =
    mark ??
    WALLET_CATALOG.find((w) => w.name.toLowerCase() === name.toLowerCase())?.mark ??
    name.slice(0, 1);
  return (
    <span className="flex size-9 items-center justify-center rounded-sm bg-surface font-display text-sm text-primary shadow-[0_0_0_1px_rgba(255,128,0,0.3)]">
      {letter}
    </span>
  );
}

export function ConnectButton({ full }: { full?: boolean }) {
  const { t } = useI18n();
  const { address, connecting, openPicker } = useWallet();

  if (address) return <AccountMenu full={full} />;

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(full && "w-full", !full && "px-3 sm:px-5")}
      disabled={connecting}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openPicker();
      }}
    >
      <Wallet className="size-4" />
      <span className={cn(!full && "max-sm:sr-only")}>{connecting ? "…" : t.nav.connect}</span>
    </Button>
  );
}

function AccountMenu({ full }: { full?: boolean }) {
  const { t } = useI18n();
  const { address, walletName, walletIcon, holdings, holdingsLoading, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  const connected = address;

  async function onCopy() {
    await copyText(connected);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-surface px-3 font-mono text-xs font-medium text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.12)] transition-colors duration-150 hover:text-primary",
            full && "w-full",
          )}
        >
          {walletIcon ? (
            <img src={walletIcon} alt="" className="size-4 rounded-sm" />
          ) : (
            <Wallet className="size-3.5 text-primary" />
          )}
          {shortAddr(address, 4, 4)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[90] w-[min(92vw,280px)] rounded-lg bg-surface p-2 shadow-[0_0_0_1px_rgba(244,236,223,0.12)]"
        >
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <WalletMark name={walletName ?? "Wallet"} icon={walletIcon} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{walletName ?? t.wallet.account}</p>
              <p className="font-mono text-[0.7rem] text-faint">{t.wallet.session}</p>
            </div>
          </div>
          <p className="mt-1 break-all px-2 font-mono text-[0.7rem] text-muted">{address}</p>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-md bg-bg p-2">
            <BalanceChip label="SOL" value={holdings?.sol} loading={holdingsLoading} />
            <BalanceChip label="FLY" value={holdings?.fly} loading={holdingsLoading} />
            <BalanceChip label="USDC" value={holdings?.usdc} loading={holdingsLoading} />
          </div>
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => void onCopy()}
              className="mt-1 flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted outline-none hover:bg-bg hover:text-fg"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? t.token.copied : t.wallet.copyAddress}
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-md px-2 text-sm text-muted outline-none hover:bg-bg hover:text-fg"
            >
              <ArrowUpRight className="size-3.5" />
              {t.wallet.explorer}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a
              href="/#swap"
              className="flex h-10 items-center gap-2 rounded-md px-2 text-sm text-muted outline-none hover:bg-bg hover:text-fg"
            >
              <Wallet className="size-3.5" />
              {t.wallet.buyFly}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => void disconnect()}
              className="flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted outline-none hover:bg-bg hover:text-primary"
            >
              <LogOut className="size-3.5" />
              {t.nav.disconnect}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function BalanceChip({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="px-1 py-1 text-center">
      <p className="font-mono text-[0.6rem] tracking-widest text-faint uppercase">{label}</p>
      <p className="mt-0.5 font-mono text-[0.7rem] tabular-nums">
        {loading ? "…" : formatAmt(value ?? 0, 3)}
      </p>
    </div>
  );
}

export function ConnectPanel({ className }: { className?: string }) {
  const { t } = useI18n();
  const { address, walletName, disconnect, holdings, holdingsLoading, available, connecting, connect, openPicker } =
    useWallet();

  return (
    <div
      className={cn(
        "rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]",
        className,
      )}
    >
      <p className="font-mono text-[0.72rem] tracking-[0.2em] text-primary uppercase">
        {t.wallet.tag}
      </p>
      <h3 className="mt-2 font-display text-lg font-semibold">{t.wallet.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.wallet.lead}</p>
      {address ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-md bg-bg px-3 py-2 font-mono text-xs text-muted">
            {walletName ?? t.wallet.account} · {shortAddr(address, 6, 4)}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-bg px-3 py-2">
              <p className="font-mono text-[0.62rem] tracking-widest text-faint uppercase">SOL</p>
              <p className="mt-1 font-mono text-sm tabular-nums">
                {holdingsLoading ? "…" : formatAmt(holdings?.sol ?? 0, 4)}
              </p>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <p className="font-mono text-[0.62rem] tracking-widest text-faint uppercase">FLY</p>
              <p className="mt-1 font-mono text-sm tabular-nums">
                {holdingsLoading ? "…" : formatAmt(holdings?.fly ?? 0, 3)}
              </p>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <p className="font-mono text-[0.62rem] tracking-widest text-faint uppercase">USDC</p>
              <p className="mt-1 font-mono text-sm tabular-nums">
                {holdingsLoading ? "…" : formatAmt(holdings?.usdc ?? 0, 2)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/#swap">
              <Button size="sm">{t.wallet.buyFly}</Button>
            </a>
            <Button variant="subtle" size="sm" onClick={() => void disconnect()}>
              {t.nav.disconnect}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {available.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {available.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={connecting}
                  onClick={() => void connect(w.id)}
                  className="flex min-h-12 items-center gap-3 rounded-md bg-bg px-4 py-2 text-left shadow-[0_0_0_1px_rgba(244,236,223,0.1)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.45)]"
                >
                  <WalletMark name={w.name} icon={w.icon} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-tight">{w.name}</span>
                    <span className="text-xs leading-tight text-faint">{t.wallet.detected}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          <Button className="w-full" onClick={openPicker}>
            <Wallet className="size-4" />
            {t.wallet.connect}
          </Button>
          <a
            href="/#swap"
            className="flex items-center justify-between rounded-md bg-bg px-4 py-4 shadow-[0_0_0_1px_rgba(255,128,0,0.28)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]"
          >
            <span>
              <span className="block text-sm font-semibold">{t.wallet.mobile}</span>
              <span className="text-xs text-faint">{t.wallet.mobileBody}</span>
            </span>
            <ArrowUpRight className="size-4 text-primary" />
          </a>
        </div>
      )}
    </div>
  );
}

export function WalletChoices({ className }: { className?: string }) {
  const { t } = useI18n();
  const { available, catalog, connecting, connect, error, closePicker } = useWallet();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(isMobileUa());
  }, []);

  return (
    <div className={className}>
      {available.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {available.map((w) => (
            <button
              key={w.id}
              type="button"
              disabled={connecting}
              onClick={() => void connect(w.id)}
              className="flex min-h-12 items-center gap-3 rounded-md bg-bg px-4 py-2 text-left shadow-[0_0_0_1px_rgba(244,236,223,0.1)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.45)]"
            >
              <WalletMark name={w.name} icon={w.icon} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight">{w.name}</span>
                <span className="text-xs leading-tight text-faint">{t.wallet.detected}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-4 font-mono text-[0.65rem] tracking-widest text-faint uppercase">
        {available.length ? t.wallet.more : t.wallet.any}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {catalog.map((w) => {
          const injected = available.some((a) => a.id === w.id);
          return (
            <button
              key={w.id}
              type="button"
              disabled={connecting}
              onClick={() => {
                if (injected) void connect(w.id);
                else openWalletInstallOrApp(w.id, w.installUrl);
              }}
              className="flex min-h-12 items-center gap-3 rounded-md bg-bg px-3 py-2 text-left shadow-[0_0_0_1px_rgba(244,236,223,0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.35)]"
            >
              <WalletMark name={w.name} mark={w.mark} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight">{w.name}</span>
                <span className="text-xs leading-tight text-faint">
                  {injected ? t.wallet.detected : mobile ? t.wallet.open : t.wallet.install}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {mobile ? (
        <p className="mt-4 text-xs leading-relaxed text-muted">{t.wallet.mobileBody}</p>
      ) : (
        <a
          href="/#swap"
          onClick={() => closePicker()}
          className="mt-4 flex items-center justify-between rounded-md bg-bg px-4 py-4 shadow-[0_0_0_1px_rgba(255,128,0,0.28)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]"
        >
          <span>
            <span className="block text-sm font-semibold">{t.wallet.mobile}</span>
            <span className="text-xs text-faint">{t.wallet.mobileBody}</span>
          </span>
          <ArrowUpRight className="size-4 text-primary" />
        </a>
      )}

      {error === "none" ? (
        <p className="mt-3 text-xs text-muted">{t.wallet.none}</p>
      ) : error && error !== "none" ? (
        <p className="mt-3 text-xs text-muted">{error}</p>
      ) : null}
    </div>
  );
}

export function WalletPicker() {
  const { t } = useI18n();
  const { pickerOpen, closePicker, address } = useWallet();

  return (
    <Dialog.Root
      open={pickerOpen}
      onOpenChange={(open) => {
        if (!open) closePicker();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-bg/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[90] max-h-[min(88dvh,720px)] w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-surface p-6 shadow-[0_0_0_1px_rgba(244,236,223,0.1)] focus:outline-none">
          <Dialog.Title className="font-display text-xl font-semibold">
            {t.wallet.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            {t.wallet.lead}
          </Dialog.Description>
          {address ? (
            <p className="mt-5 rounded-md bg-bg px-3 py-2 font-mono text-xs text-muted">
              {t.donate.connected} · {shortAddr(address, 6, 4)}
            </p>
          ) : (
            <WalletChoices className="mt-5" />
          )}
          <Dialog.Close asChild>
            <Button type="button" variant="ghost" className="mt-5 w-full" onClick={closePicker}>
              {t.donate.close}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
