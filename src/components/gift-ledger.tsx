import type { Gift } from "@/lib/associations";
import { SITE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { formatWhen, shortAddr } from "@/lib/utils";

export function GiftLedger({ gifts, empty }: { gifts: Gift[]; empty: string }) {
  const { t, lang } = useI18n();
  if (!gifts.length) {
    return (
      <p className="rounded-lg bg-surface px-5 py-8 text-center text-sm text-muted shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
        {empty}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]">
      {gifts.map((gift) => {
        const who =
          gift.donorName ||
          (gift.donorWallet ? shortAddr(gift.donorWallet, 4, 4) : t.org.anonymous);
        const nexa = gift.source === "nexa" || gift.donorWallet === SITE.wallet;
        return (
          <li key={gift.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {gift.amount} {gift.token}
                {nexa ? (
                  <span className="ml-2 font-mono text-[0.65rem] tracking-widest text-primary uppercase">
                    {t.org.nexaGrant}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-muted">
                {who}
                {gift.message ? ` · ${gift.message}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-faint">
              <span>{formatWhen(gift.createdAt, lang)}</span>
              {gift.txSignature ? (
                <a
                  href={`https://solscan.io/tx/${gift.txSignature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  Solscan
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
