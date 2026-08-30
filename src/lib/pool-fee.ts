import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SITE } from "./constants";

const RPC = "https://api.mainnet-beta.solana.com";

type Injected = {
  publicKey?: { toString: () => string };
  connect?: () => Promise<unknown>;
  signAndSendTransaction?: (
    tx: Transaction,
  ) => Promise<string | { signature?: string }>;
};

export function listingLamports() {
  return Math.round(SITE.poolListingSol * LAMPORTS_PER_SOL);
}

function provider(): Injected | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    solana?: Injected;
    phantom?: { solana?: Injected };
    solflare?: Injected;
    backpack?: Injected;
  };
  return w.phantom?.solana ?? w.solana ?? w.solflare ?? w.backpack ?? null;
}

export async function payPoolListing(): Promise<string> {
  const wallet = provider();
  if (!wallet?.signAndSendTransaction) throw new Error("wallet");
  if (!wallet.publicKey) await wallet.connect?.();
  const fromStr = wallet.publicKey?.toString();
  if (!fromStr) throw new Error("wallet");

  const from = new PublicKey(fromStr);
  const connection = new Connection(RPC, "confirmed");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: new PublicKey(SITE.wallet),
      lamports: listingLamports(),
    }),
  );
  tx.feePayer = from;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const res = await wallet.signAndSendTransaction(tx);
  const sig = typeof res === "string" ? res : res.signature;
  if (!sig) throw new Error("signature");
  return sig;
}
