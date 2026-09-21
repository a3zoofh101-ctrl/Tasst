"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { ADMIN_NAV } from "@/components/smm/admin/nav";
import { Logo } from "@/components/smm/ui/Logo";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-border2 bg-surface lg:flex">
      <div className="px-6 py-5">
        <Logo href="/admin" subtitle="إدارة" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto smm-scrollbar px-3">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
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

      <div className="border-t border-border2 p-3">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-surface2">
          <ArrowLeftRight className="size-[18px]" />
          لوحة العميل
        </Link>
      </div>
    </aside>
  );
}
