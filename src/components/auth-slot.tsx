import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Building2, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { cn, initials } from "@/lib/utils";

export function AuthSlot({ full }: { full?: boolean }) {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div
        className={cn(
          "h-11 animate-pulse rounded-md bg-surface shadow-[0_0_0_1px_rgba(244,236,223,0.08)]",
          full ? "w-full" : "w-11 lg:w-24",
        )}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-transparent px-3 text-sm font-semibold text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.14)] transition-colors duration-150 hover:text-primary",
          full && "w-full",
        )}
      >
        <Building2 className="size-4" />
        <span className={cn(!full && "hidden sm:inline")}>{t.nav.space}</span>
      </a>
    );
  }

  return <AccountChip full={full} />;
}

function AccountChip({ full }: { full?: boolean }) {
  const { t } = useI18n();
  const { user } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? t.nav.account;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-surface px-2.5 font-semibold text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.12)] transition-colors duration-150 hover:text-primary",
            full && "w-full",
          )}
        >
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="size-7 rounded-sm object-cover outline outline-1 -outline-offset-1 outline-fg/10"
            />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-sm bg-bg font-display text-[0.7rem] text-primary shadow-[0_0_0_1px_rgba(255,128,0,0.3)]">
              {initials(label)}
            </span>
          )}
          <span className={cn("max-w-28 truncate text-xs", !full && "max-lg:sr-only")}>
            {label}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[70] min-w-52 rounded-lg bg-surface p-1.5 shadow-[0_0_0_1px_rgba(244,236,223,0.12)]"
        >
          <DropdownMenu.Item asChild>
            <a
              href="/espace"
              className="flex h-11 items-center gap-2 rounded-md px-3 text-sm text-fg outline-none hover:bg-bg"
            >
              <Building2 className="size-4 text-primary" />
              {t.nav.space}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            disabled={signingOut}
            onSelect={() => {
              setSigningOut(true);
              void signOut("/").catch(() => setSigningOut(false));
            }}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-muted outline-none hover:bg-bg hover:text-fg"
          >
            <LogOut className="size-4" />
            {signingOut ? t.login.submitting : t.nav.signOut}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
