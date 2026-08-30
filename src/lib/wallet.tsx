import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getHoldings, type Holdings } from "@/lib/holdings";
import {
  catalogWithDetected,
  listWallets,
  openWalletInstallOrApp,
  subscribeWallets,
  type WalletAdapter,
  WALLET_CATALOG,
} from "@/lib/wallet-standard";

type Session = {
  walletId: string;
  walletName: string;
  address: string;
  connectedAt: number;
};

type WalletValue = {
  address: string | null;
  walletName: string | null;
  walletIcon: string | null;
  connecting: boolean;
  error: string | null;
  available: WalletAdapter[];
  catalog: typeof WALLET_CATALOG;
  holdings: Holdings | null;
  holdingsLoading: boolean;
  pickerOpen: boolean;
  connectedAt: number | null;
  openPicker: () => void;
  closePicker: () => void;
  connect: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

const SESSION_KEY = "nexafly-session";
const WalletContext = createContext<WalletValue | null>(null);

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.address || !parsed?.walletId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletIcon, setWalletIcon] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<WalletAdapter[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [holdings, setHoldings] = useState<Holdings | null>(null);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const reconnectTried = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const scan = useCallback(() => {
    setAvailable(listWallets());
  }, []);

  useEffect(() => {
    const stop = subscribeWallets(scan);
    const id = window.setInterval(scan, 800);
    const halt = window.setTimeout(() => window.clearInterval(id), 12_000);
    window.addEventListener("load", scan);
    return () => {
      stop();
      window.clearInterval(id);
      window.clearTimeout(halt);
      window.removeEventListener("load", scan);
    };
  }, [scan]);

  const attachChange = useCallback((wallet: WalletAdapter) => {
    unsubRef.current?.();
    unsubRef.current = wallet.onChange((next) => {
      if (!next) {
        setAddress(null);
        setWalletName(null);
        setWalletIcon(null);
        setActiveId(null);
        setConnectedAt(null);
        writeSession(null);
        return;
      }
      setAddress(next);
      writeSession({
        walletId: wallet.id,
        walletName: wallet.name,
        address: next,
        connectedAt: Date.now(),
      });
    });
  }, []);

  const connect = useCallback(
    async (id: string) => {
      setError(null);
      const list = listWallets();
      setAvailable(list);
      const chosen = list.find((w) => w.id === id);
      if (!chosen) {
        const fallback = WALLET_CATALOG.find((w) => w.id === id);
        if (fallback) openWalletInstallOrApp(fallback.id, fallback.installUrl);
        else setError("none");
        return;
      }
      setConnecting(true);
      try {
        const next = await chosen.connect(false);
        const at = Date.now();
        setAddress(next);
        setWalletName(chosen.name);
        setWalletIcon(chosen.icon ?? null);
        setActiveId(chosen.id);
        setConnectedAt(at);
        setPickerOpen(false);
        writeSession({
          walletId: chosen.id,
          walletName: chosen.name,
          address: next,
          connectedAt: at,
        });
        attachChange(chosen);
      } catch (err) {
        setError(err instanceof Error ? err.message : "rejected");
      } finally {
        setConnecting(false);
      }
    },
    [attachChange],
  );

  const disconnect = useCallback(async () => {
    const list = listWallets();
    const active = list.find((w) => w.id === activeId);
    try {
      await active?.disconnect();
    } catch {
      /* ignore */
    }
    unsubRef.current?.();
    unsubRef.current = null;
    setAddress(null);
    setWalletName(null);
    setWalletIcon(null);
    setActiveId(null);
    setConnectedAt(null);
    setHoldings(null);
    writeSession(null);
  }, [activeId]);

  useEffect(() => {
    if (reconnectTried.current) return;
    if (!available.length) return;
    const session = readSession();
    if (!session) {
      reconnectTried.current = true;
      return;
    }
    const wallet =
      available.find((w) => w.id === session.walletId) ??
      available.find((w) => w.name.toLowerCase() === session.walletName.toLowerCase());
    if (!wallet) return;
    reconnectTried.current = true;
    let cancelled = false;
    (async () => {
      try {
        const next = await wallet.connect(true);
        if (cancelled) return;
        setAddress(next);
        setWalletName(wallet.name);
        setWalletIcon(wallet.icon ?? null);
        setActiveId(wallet.id);
        setConnectedAt(session.connectedAt);
        writeSession({ ...session, address: next });
        attachChange(wallet);
      } catch {
        /* stay disconnected; user can tap Connect */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [available, attachChange]);

  useEffect(() => {
    if (!address) {
      setHoldings(null);
      return;
    }
    let cancelled = false;
    setHoldingsLoading(true);
    getHoldings({ data: { address } })
      .then((next) => {
        if (!cancelled) setHoldings(next);
      })
      .catch(() => {
        if (!cancelled) setHoldings(null);
      })
      .finally(() => {
        if (!cancelled) setHoldingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const value = useMemo<WalletValue>(
    () => ({
      address,
      walletName,
      walletIcon,
      connecting,
      error,
      available,
      catalog: catalogWithDetected(available).rest,
      holdings,
      holdingsLoading,
      pickerOpen,
      connectedAt,
      openPicker: () => {
        setError(null);
        setPickerOpen(true);
      },
      closePicker: () => setPickerOpen(false),
      connect,
      disconnect,
    }),
    [
      address,
      walletName,
      walletIcon,
      connecting,
      error,
      available,
      holdings,
      holdingsLoading,
      pickerOpen,
      connectedAt,
      connect,
      disconnect,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
