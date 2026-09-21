"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { DASHBOARD_NAV } from "@/components/smm/dashboard/nav";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-border2 bg-surface lg:flex">
      <Link href="/smm" className="flex items-center gap-2 px-6 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Sparkles className="size-5" />
        </span>
        <span className="text-lg font-extrabold text-fg">تَسّت</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {DASHBOARD_NAV.map((item) => {
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
