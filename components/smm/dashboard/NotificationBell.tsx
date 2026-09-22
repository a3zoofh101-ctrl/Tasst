"use client";

import { useTransition } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { markAllNotificationsReadAction } from "@/lib/smm/actions/notifications";

export type NotificationDto = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({ notifications, unreadCount }: { notifications: NotificationDto[]; unreadCount: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface2"
          aria-label="الإشعارات"
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-2xl border border-border2 bg-surface p-2 shadow-xl"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-bold text-fg">الإشعارات</p>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => markAllNotificationsReadAction())}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          <div className="max-h-80 space-y-0.5 overflow-y-auto smm-scrollbar">
            {notifications.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted">لا توجد إشعارات بعد</p>
            )}
            {notifications.map((n) => (
              <DropdownMenu.Item key={n.id} asChild>
                <Link
                  href={n.link ?? "#"}
                  className={cn(
                    "block rounded-xl px-2.5 py-2 text-sm outline-none hover:bg-surface2",
                    !n.read && "bg-brand-50/60 dark:bg-brand-900/20"
                  )}
                >
                  <p className="font-semibold text-fg">{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>}
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
