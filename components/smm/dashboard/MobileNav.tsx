"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/smm/cn";
import { DASHBOARD_NAV } from "@/components/smm/dashboard/nav";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border2 bg-surface/80 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
      {DASHBOARD_NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        // "طلب جديد" is the primary action here — raise it as a filled
        // circular button instead of just another flat tab, so it reads
        // as the thing most people tap, the way a FAB would.
        if (item.href === "/dashboard/new-order") {
          return (
            <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center justify-end gap-1 pb-1.5">
              <span className="flex size-11 -translate-y-3 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow transition-transform active:scale-95">
                <item.icon className="size-5" />
              </span>
              <span className={cn("text-[11px] font-medium", active ? "text-brand-600" : "text-muted")}>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors", active ? "text-brand-600" : "text-muted")}
          >
            <span className={cn("flex size-8 items-center justify-center rounded-full", active && "bg-brand-50 dark:bg-brand-900/40")}>
              <item.icon className="size-5" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
