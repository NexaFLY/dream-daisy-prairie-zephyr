import { createServerFn } from "@tanstack/react-start";
import { SITE } from "./constants";

export type Holdings = {
  sol: number;
  fly: number;
  usdc: number;
  nusd: number;
};

const EMPTY: Holdings = { sol: 0, fly: 0, usdc: 0, nusd: 0 };

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const RPC = "https://api.mainnet-beta.solana.com";

function pickUi(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  const row = value as { uiAmount?: number; uiAmountString?: string };
  if (typeof row.uiAmount === "number" && Number.isFinite(row.uiAmount)) return row.uiAmount;
  const n = Number(row.uiAmountString);
  return Number.isFinite(n) ? n : 0;
}

function fromJupiterPayload(json: unknown): Holdings | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const tokens =
    root.tokens && typeof root.tokens === "object"
      ? (root.tokens as Record<string, unknown>)
      : root;

  const sol =
    pickUi(root) ||
    pickUi(root.SOL) ||
    pickUi(root.sol) ||
    pickUi(tokens.SOL) ||
    pickUi(tokens[SITE.solMint]);

  return {
    sol,
    fly: pickUi(tokens[SITE.mint]),
    usdc: pickUi(tokens[SITE.usdcMint]),
    nusd: pickUi(tokens[SITE.nusdMint]),
  };
}

async function fromJupiter(address: string): Promise<Holdings | null> {
  try {
    const res = await fetch(`https://lite-api.jup.ag/ultra/v1/holdings/${address}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return fromJupiterPayload(await res.json());
  } catch {
    return null;
  }
}

type RpcRow = { result?: unknown };

function tokenUi(result: unknown): number {
  const accounts =
    (result as {
      value?: Array<{
        account?: { data?: { parsed?: { info?: { tokenAmount?: { uiAmount?: number } } } } };
      }>;
    })?.value ?? [];
  return accounts.reduce(
    (sum, row) => sum + (row.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0),
    0,
  );
}

async function fromRpc(address: string): Promise<Holdings | null> {
  try {
    const body = [
      { jsonrpc: "2.0", id: 1, method: "getBalance", params: [address] },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "getTokenAccountsByOwner",
        params: [address, { mint: SITE.mint }, { encoding: "jsonParsed" }],
      },
      {
        jsonrpc: "2.0",
        id: 3,
        method: "getTokenAccountsByOwner",
        params: [address, { mint: SITE.usdcMint }, { encoding: "jsonParsed" }],
      },
      {
        jsonrpc: "2.0",
        id: 4,
        method: "getTokenAccountsByOwner",
        params: [address, { mint: SITE.nusdMint }, { encoding: "jsonParsed" }],
      },
    ];
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as RpcRow[];
    const lamports = (rows[0]?.result as { value?: number } | undefined)?.value ?? 0;
    return {
      sol: lamports / 1_000_000_000,
      fly: tokenUi(rows[1]?.result),
      usdc: tokenUi(rows[2]?.result),
      nusd: tokenUi(rows[3]?.result),
    };
  } catch {
    return null;
  }
}

export const getHoldings = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const address =
      typeof input === "object" && input && "address" in input
        ? String((input as { address: unknown }).address)
        : "";
    if (!BASE58.test(address)) throw new Error("invalid address");
    return { address };
  })
  .handler(async ({ data }): Promise<Holdings> => {
    const jup = await fromJupiter(data.address);
    if (jup) return jup;
    return (await fromRpc(data.address)) ?? EMPTY;
  });
