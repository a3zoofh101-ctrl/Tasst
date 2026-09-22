"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { logoutAction } from "@/lib/smm/actions/auth";

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
            {name.charAt(0)}
          </span>
          <span className="hidden text-right sm:block">
            <span className="block text-sm font-semibold text-fg">{name}</span>
          </span>
          <ChevronDown className="size-4 text-muted" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-56 rounded-2xl border border-border2 bg-surface p-2 shadow-xl">
          <div className="px-2.5 py-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
              <UserIcon className="size-3.5" /> {name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border2" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-danger hover:bg-danger-bg"
            >
              <LogOut className="size-4" />
              تسجيل الخروج
            </button>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
