"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { formatMoney } from "@/lib/smm/money";
import { Logo } from "@/components/smm/ui/Logo";
import { logoutAction } from "@/lib/smm/actions/auth";
import { DASHBOARD_NAV } from "@/components/smm/dashboard/nav";
import { ADMIN_NAV } from "@/components/smm/admin/nav";

// navItems is intentionally NOT a prop: its entries hold icon *component*
// references, and passing those from a Server Component parent (both
// DashboardShell and AdminShell render this) across the server/client
// boundary breaks RSC serialization. Importing the nav lists here instead
// keeps every icon reference on the client side.
export function MobileDrawer({
  variant,
  isAdmin,
  name,
  email,
  balance,
  logoSubtitle
}: {
  variant: "dashboard" | "admin";
  isAdmin?: boolean;
  name: string;
  email: string;
  balance?: string;
  logoSubtitle?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems =
    variant === "admin"
      ? ADMIN_NAV
      : isAdmin
        ? [...DASHBOARD_NAV, { href: "/admin", label: "لوحة الإدارة", icon: ShieldCheck }]
        : DASHBOARD_NAV;

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        <button
          type="button"
          aria-label="فتح القائمة"
          className="flex size-9 items-center justify-center rounded-xl text-fg hover:bg-surface2 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fadeIn lg:hidden" />
        <RadixDialog.Content
          className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[82%] max-w-[340px] flex-col bg-surface shadow-2xl outline-none data-[state=open]:animate-drawerIn data-[state=closed]:animate-drawerOut lg:hidden"
        >
          <RadixDialog.Title className="sr-only">القائمة الرئيسية</RadixDialog.Title>
          <RadixDialog.Description className="sr-only">التنقل بين صفحات الحساب</RadixDialog.Description>

          <div className="flex items-center justify-between border-b border-border2 p-4">
            <Logo size="sm" href={null} subtitle={logoSubtitle} />
            <RadixDialog.Close
              aria-label="إغلاق القائمة"
              className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-fg"
            >
              <X className="size-5" />
            </RadixDialog.Close>
          </div>

          <div className="border-b border-border2 p-4">
            <p className="truncate font-bold text-fg">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
            {balance !== undefined && (
              <p className="mt-1.5 text-lg font-extrabold text-brand-600 dark:text-brand-300">{formatMoney(balance)}</p>
            )}
          </div>

          <nav className="smm-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href.length > 1 && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "text-fg hover:bg-surface2"
                  )}
                >
                  {active && <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-brand-600" />}
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border2 p-3">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-danger hover:bg-danger-bg"
              >
                <LogOut className="size-5" />
                تسجيل الخروج
              </button>
            </form>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
