import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { recordGift, type Gift, type GiftToken } from "@/lib/associations";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import { areaClass, cn, copyText, fieldClass, shortAddr } from "@/lib/utils";

const TOKENS: GiftToken[] = ["SOL", "USDC", "FLY", "nUSD"];

export function GiftPanel({
  slug,
  wallet,
  hosted = false,
  onRecorded,
}: {
  slug: string;
  wallet: string;
  hosted?: boolean;
  onRecorded: (gift: Gift) => void;
}) {
  const { t } = useI18n();
  const { address, openPicker } = useWallet();
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<GiftToken>("USDC");
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [tx, setTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fromNexa = address === SITE.wallet;

  async function onCopy() {
    await copyText(wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const gift = await recordGift({
        data: {
          slug,
          token,
          amount,
          donorWallet: address ?? "",
          donorName,
          message,
          txSignature: tx,
        },
      });
      setDone(true);
      setAmount("");
      setMessage("");
      setTx("");
      onRecorded(gift);
    } catch {
      setError(t.org.errAmount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(244,236,223,0.08)] md:p-6">
      <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
        {t.org.donate}
      </p>
      {hosted ? (
        <p className="mt-2 rounded-md bg-bg px-3 py-2 text-xs font-semibold text-amber shadow-[0_0_0_1px_rgba(255,180,84,0.25)]">
          {t.org.hosted}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {hosted ? t.org.hostedLead : t.org.donateLead}
      </p>

      {fromNexa ? (
        <p className="mt-4 rounded-md bg-bg px-3 py-2 text-xs font-semibold text-amber shadow-[0_0_0_1px_rgba(255,180,84,0.25)]">
          {t.org.fromNexa}
        </p>
      ) : null}

      <div className="mt-5 rounded-lg bg-bg p-4 shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
        <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
          {t.org.onchain}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-fg">{wallet}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="subtle" onClick={onCopy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? t.token.copied : t.org.copyWallet}
          </Button>
          <a
            href={`https://solscan.io/account/${wallet}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            {t.org.viewChain} <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>

      {!address ? (
        <Button className="mt-4 w-full" variant="ghost" onClick={openPicker}>
          {t.wallet.connect}
        </Button>
      ) : (
        <p className="mt-4 font-mono text-xs text-muted">
          {t.donate.connected} · {shortAddr(address, 6, 4)}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <p className="font-mono text-[0.65rem] tracking-widest text-faint uppercase">
          {t.org.record}
        </p>
        <p className="text-xs leading-relaxed text-muted">{t.org.recordLead}</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-muted">
            {t.org.token}
            <select
              value={token}
              onChange={(e) => setToken(e.target.value as GiftToken)}
              className={fieldClass}
            >
              {TOKENS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-muted">
            {t.org.amount}
            <input
              required
              id="gift-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block text-xs font-semibold text-muted">
          {t.org.donorName}
          <input
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder={t.org.donorNamePh}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {t.org.message}
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.org.messagePh}
            className={areaClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {t.org.tx}
          <input
            value={tx}
            onChange={(e) => setTx(e.target.value)}
            placeholder={t.org.txPh}
            className={fieldClass}
          />
        </label>
        {error ? <p className="text-xs text-amber">{error}</p> : null}
        {done ? <p className="text-xs text-primary">{t.org.recorded}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t.login.submitting : t.org.send}
        </Button>
      </form>
    </div>
  );
}
