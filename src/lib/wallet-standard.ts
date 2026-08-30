export type StandardAccount = {
  address: string;
  publicKey?: Uint8Array;
};

export type StandardWallet = {
  name: string;
  icon?: string;
  chains?: string[];
  accounts: StandardAccount[];
  features: Record<string, unknown>;
};

type ConnectFeature = {
  connect: (opts?: { silent?: boolean }) => Promise<{ accounts: StandardAccount[] }>;
};

type DisconnectFeature = {
  disconnect: () => Promise<void>;
};

type EventsFeature = {
  on: (event: string, listener: (...args: unknown[]) => void) => () => void;
};

type InjectedProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  isGlow?: boolean;
  publicKey?: { toString: () => string };
  connect?: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toString: () => string } } | void>;
  disconnect?: () => Promise<void>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export type WalletAdapter = {
  id: string;
  name: string;
  icon?: string;
  ready: boolean;
  installUrl?: string;
  connect: (silent?: boolean) => Promise<string>;
  disconnect: () => Promise<void>;
  onChange: (listener: (address: string | null) => void) => () => void;
};

export const WALLET_CATALOG: Array<{
  id: string;
  name: string;
  installUrl: string;
  mark: string;
}> = [
  { id: "phantom", name: "Phantom", installUrl: "https://phantom.app/", mark: "P" },
  { id: "solflare", name: "Solflare", installUrl: "https://solflare.com/", mark: "S" },
  { id: "backpack", name: "Backpack", installUrl: "https://backpack.app/", mark: "B" },
  { id: "glow", name: "Glow", installUrl: "https://glow.app/", mark: "G" },
  { id: "okx", name: "OKX", installUrl: "https://www.okx.com/web3", mark: "O" },
  { id: "coinbase", name: "Coinbase", installUrl: "https://www.coinbase.com/wallet", mark: "C" },
  { id: "brave", name: "Brave", installUrl: "https://brave.com/wallet", mark: "Br" },
  { id: "exodus", name: "Exodus", installUrl: "https://www.exodus.com/", mark: "E" },
  { id: "trust", name: "Trust", installUrl: "https://trustwallet.com/", mark: "T" },
  { id: "nightly", name: "Nightly", installUrl: "https://nightly.app/", mark: "N" },
];

const SOLANA_FEATURES = [
  "solana:signAndSendTransaction",
  "solana:signTransaction",
  "solana:signMessage",
];

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isSolanaWallet(wallet: StandardWallet) {
  const chains = wallet.chains ?? [];
  if (chains.some((c) => c.startsWith("solana:"))) return true;
  return SOLANA_FEATURES.some((f) => f in wallet.features);
}

function feature<T>(wallet: StandardWallet, name: string): T | undefined {
  return wallet.features[name] as T | undefined;
}

function fromStandard(wallet: StandardWallet): WalletAdapter {
  const id = slug(wallet.name);
  return {
    id,
    name: wallet.name,
    icon: wallet.icon,
    ready: true,
    installUrl: WALLET_CATALOG.find((c) => c.id === id)?.installUrl,
    connect: async (silent) => {
      if (silent && wallet.accounts[0]?.address) return wallet.accounts[0].address;
      const conn = feature<ConnectFeature>(wallet, "standard:connect");
      if (!conn?.connect) throw new Error("unsupported");
      const res = await conn.connect(silent ? { silent: true } : undefined);
      const address = res.accounts[0]?.address ?? wallet.accounts[0]?.address;
      if (!address) throw new Error("no-account");
      return address;
    },
    disconnect: async () => {
      await feature<DisconnectFeature>(wallet, "standard:disconnect")?.disconnect?.();
    },
    onChange: (listener) => {
      const events = feature<EventsFeature>(wallet, "standard:events");
      if (!events?.on) return () => {};
      return events.on("change", (...args) => {
        const detail = args[0] as { accounts?: StandardAccount[] } | undefined;
        const next = detail?.accounts?.[0]?.address ?? wallet.accounts[0]?.address ?? null;
        listener(next);
      });
    },
  };
}

function fromInjected(id: string, name: string, provider: InjectedProvider): WalletAdapter {
  return {
    id,
    name,
    ready: true,
    installUrl: WALLET_CATALOG.find((c) => c.id === id)?.installUrl,
    connect: async (silent) => {
      if (silent && provider.publicKey) return provider.publicKey.toString();
      if (!provider.connect) throw new Error("unsupported");
      const res = silent
        ? await provider.connect({ onlyIfTrusted: true })
        : await provider.connect();
      const address =
        res && "publicKey" in res && res.publicKey
          ? res.publicKey.toString()
          : provider.publicKey?.toString();
      if (!address) throw new Error("no-account");
      return address;
    },
    disconnect: async () => {
      await provider.disconnect?.();
    },
    onChange: (listener) => {
      if (!provider.on) return () => {};
      const onAccount = (pk: unknown) => {
        if (!pk) {
          listener(null);
          return;
        }
        if (typeof pk === "string") listener(pk);
        else if (typeof pk === "object" && pk && "toString" in pk) {
          listener((pk as { toString: () => string }).toString());
        }
      };
      const onDisconnect = () => listener(null);
      provider.on("accountChanged", onAccount);
      provider.on("disconnect", onDisconnect);
      return () => {
        provider.off?.("accountChanged", onAccount);
        provider.off?.("disconnect", onDisconnect);
      };
    },
  };
}

function readInjected(): WalletAdapter[] {
  if (typeof window === "undefined") return [];
  const w = window as Window & {
    solana?: InjectedProvider;
    solflare?: InjectedProvider;
    phantom?: { solana?: InjectedProvider };
    backpack?: InjectedProvider;
    glow?: InjectedProvider;
    glowSolana?: InjectedProvider;
    coinbaseSolana?: InjectedProvider;
    braveSolana?: InjectedProvider;
    exodus?: { solana?: InjectedProvider };
    nightly?: { solana?: InjectedProvider };
    okxwallet?: { solana?: InjectedProvider };
    trustwallet?: { solana?: InjectedProvider };
    magicEden?: { solana?: InjectedProvider };
  };
  const out: WalletAdapter[] = [];
  const phantom = w.phantom?.solana ?? (w.solana?.isPhantom ? w.solana : undefined);
  if (phantom) out.push(fromInjected("phantom", "Phantom", phantom));
  if (w.solflare) out.push(fromInjected("solflare", "Solflare", w.solflare));
  if (w.backpack) out.push(fromInjected("backpack", "Backpack", w.backpack));
  const glow = w.glowSolana ?? w.glow;
  if (glow) out.push(fromInjected("glow", "Glow", glow));
  if (w.okxwallet?.solana) out.push(fromInjected("okx", "OKX", w.okxwallet.solana));
  if (w.coinbaseSolana) out.push(fromInjected("coinbase", "Coinbase", w.coinbaseSolana));
  if (w.braveSolana) out.push(fromInjected("brave", "Brave", w.braveSolana));
  if (w.exodus?.solana) out.push(fromInjected("exodus", "Exodus", w.exodus.solana));
  if (w.nightly?.solana) out.push(fromInjected("nightly", "Nightly", w.nightly.solana));
  if (w.trustwallet?.solana) out.push(fromInjected("trust", "Trust", w.trustwallet.solana));
  if (w.magicEden?.solana) out.push(fromInjected("magiceden", "Magic Eden", w.magicEden.solana));
  if (w.solana && !w.solana.isPhantom && !out.length) {
    out.push(fromInjected("injected", "Solana", w.solana));
  }
  return out;
}

const walletsCache: StandardWallet[] = [];
const listeners = new Set<() => void>();
let hooked = false;

function registerWallet(wallet: StandardWallet) {
  if (!isSolanaWallet(wallet)) return;
  if (walletsCache.some((w) => w.name === wallet.name)) return;
  walletsCache.push(wallet);
  listeners.forEach((fn) => fn());
}

function hookStandard() {
  if (hooked || typeof window === "undefined") return;
  hooked = true;
  const api = { register: registerWallet };
  try {
    window.addEventListener("wallet-standard:register-wallet", ((event: Event) => {
      const detail = (event as CustomEvent<{ register?: (api: { register: typeof registerWallet }) => void }>).detail;
      detail?.register?.(api);
    }) as EventListener);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(
      new CustomEvent("wallet-standard:app-ready", {
        detail: api,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function subscribeWallets(onChange: () => void) {
  hookStandard();
  listeners.add(onChange);
  onChange();
  return () => {
    listeners.delete(onChange);
  };
}

export function listWallets(): WalletAdapter[] {
  hookStandard();
  const byId = new Map<string, WalletAdapter>();
  for (const wallet of walletsCache) {
    const adapter = fromStandard(wallet);
    byId.set(adapter.id, adapter);
  }
  for (const injected of readInjected()) {
    if (!byId.has(injected.id)) byId.set(injected.id, injected);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function catalogWithDetected(detected: WalletAdapter[]) {
  const readyIds = new Set(detected.map((w) => w.id));
  const readyNames = new Set(detected.map((w) => w.name.toLowerCase()));
  const rest = WALLET_CATALOG.filter(
    (c) => !readyIds.has(c.id) && !readyNames.has(c.name.toLowerCase()),
  );
  return { detected, rest };
}

export function isMobileUa() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function walletBrowseUrl(id: string, pageUrl: string) {
  const encoded = encodeURIComponent(pageUrl);
  let ref = "";
  try {
    ref = encodeURIComponent(new URL(pageUrl).origin);
  } catch {
    ref = encoded;
  }
  switch (id) {
    case "phantom":
      return `https://phantom.app/ul/browse/${encoded}?ref=${ref}`;
    case "solflare":
      return `https://solflare.com/ul/v1/browse/${encoded}?ref=${ref}`;
    case "backpack":
      return `https://backpack.app/ul/v1/browse/${encoded}`;
    case "trust":
      return `https://link.trustwallet.com/open_url?coin_id=501&url=${encoded}`;
    case "glow":
      return `https://glow.app/ul/browse?url=${encoded}`;
    default:
      return null;
  }
}

export function openWalletInstallOrApp(id: string, installUrl: string) {
  if (typeof window === "undefined") return;
  if (isMobileUa()) {
    const deep = walletBrowseUrl(id, window.location.href);
    if (deep) {
      window.location.assign(deep);
      return;
    }
  }
  window.open(installUrl, "_blank", "noreferrer");
}
