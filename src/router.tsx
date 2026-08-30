import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultPreload: false,
    defaultOnCatch: (error) => {
      const message = error instanceof Error ? error.message : String(error ?? "");
      if (
        /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
          message,
        )
      ) {
        try {
          const key = "nexa-stale-reload";
          const last = Number(sessionStorage.getItem(key) || "0");
          if (Date.now() - last < 5000) return;
          sessionStorage.setItem(key, String(Date.now()));
        } catch {
          /* ignore */
        }
        window.location.reload();
      }
    },
  });
}
