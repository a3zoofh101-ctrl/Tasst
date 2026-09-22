"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { DASHBOARD_NAV } from "@/components/smm/dashboard/nav";
import { Logo } from "@/components/smm/ui/Logo";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-border2 bg-surface lg:flex">
      <div className="px-6 py-5">
        <Logo />
      </div>

      <div className="px-3 pb-3">
        <Link
          href="/dashboard/new-order"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-bold text-white shadow-glow transition-shadow hover:shadow-glowLg"
        >
          <ShoppingCart className="size-[18px]" />
          طلب جديد
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {DASHBOARD_NAV.filter((item) => item.href !== "/dashboard/new-order").map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "text-muted hover:bg-surface2 hover:text-fg"
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isAdmin && (
        <div className="border-t border-border2 p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
          >
            <ShieldCheck className="size-[18px]" />
            لوحة الإدارة
          </Link>
        </div>
      )}
    </aside>
  );
}
