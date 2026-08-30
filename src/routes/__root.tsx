import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppErrorComponent } from "@/lib/error-component";
import { I18nProvider } from "@/lib/i18n";
import { WalletProvider } from "@/lib/wallet";
import appCss from "../styles.css?url";

const APP_NAME = "Nexa FLY";

export const Route = createRootRoute({
  errorComponent: AppErrorComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Nexa FLY is a French Law 1901 association building transparent donation tools on Solana.",
      },
      { name: "theme-color", content: "#0b0906" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Unbounded:wght@500;600;700&display=swap",
      },
      { rel: "preconnect", href: "https://lite-api.jup.ag", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://titan.exchange" },
    ],
    scripts: [{ src: "/nav-guard.js" }],
  }),
  component: () => (
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <I18nProvider>
            <WalletProvider>
              <Outlet />
            </WalletProvider>
          </I18nProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
