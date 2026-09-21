"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/smm/cn";
import { DASHBOARD_NAV } from "@/components/smm/dashboard/nav";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border2 bg-surface/95 backdrop-blur px-1 py-1.5 lg:hidden">
      {DASHBOARD_NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium",
              active ? "text-brand-600" : "text-muted"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
