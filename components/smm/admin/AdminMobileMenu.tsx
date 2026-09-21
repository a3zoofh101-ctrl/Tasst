"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { ADMIN_NAV } from "@/components/smm/admin/nav";

export function AdminMobileMenu() {
  const pathname = usePathname();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface2 lg:hidden">
          <Menu className="size-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className="z-50 w-64 rounded-2xl border border-border2 bg-surface p-2 shadow-xl">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <DropdownMenu.Item key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none",
                    active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface2 hover:text-fg"
                  )}
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
