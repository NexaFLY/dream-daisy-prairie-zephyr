import { SITE } from "@/lib/constants";

type WatchOpts = {
  mint?: string;
  symbol?: string;
  decimals?: number;
  image?: string;
};

export async function watchSplToken(opts: WatchOpts = {}) {
  const mint = opts.mint ?? SITE.mint;
  const symbol = opts.symbol ?? "FLY";
  const decimals = opts.decimals ?? 6;
  const image =
    opts.image ??
    (typeof window !== "undefined" ? `${window.location.origin}/logo-mark.png` : "/logo-mark.png");
  const provider = (
    window as unknown as {
      phantom?: { solana?: { request?: (args: unknown) => Promise<unknown> } };
      solana?: { request?: (args: unknown) => Promise<unknown> };
    }
  ).phantom?.solana ?? (window as unknown as { solana?: { request?: (args: unknown) => Promise<unknown> } }).solana;
  if (!provider?.request) throw new Error("nowallet");
  await provider.request({
    method: "wallet_watchAsset",
    params: {
      type: "SPL",
      options: { address: mint, symbol, decimals, image },
    },
  });
}
