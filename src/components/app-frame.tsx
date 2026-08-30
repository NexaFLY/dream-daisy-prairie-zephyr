import { DonateDialog, SiteFooter, SiteHeader } from "@/components/chrome";
import { WalletPicker } from "@/components/wallet-connect";
import { createContext, useContext, useState, type ReactNode } from "react";

const DonateContext = createContext<() => void>(() => {});

export function useDonate() {
  return useContext(DonateContext);
}

export function AppFrame({ children }: { children: ReactNode }) {
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <DonateContext.Provider value={() => setDonateOpen(true)}>
      <div className="relative min-h-dvh bg-bg text-fg">
        <div className="grain" aria-hidden />
        <div className="relative z-10">
          <SiteHeader onDonate={() => setDonateOpen(true)} />
          {children}
          <SiteFooter />
        </div>
        <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
        <WalletPicker />
      </div>
    </DonateContext.Provider>
  );
}
