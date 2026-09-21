import type { LucideIcon } from "lucide-react";
import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/smm/cn";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border2 px-6 py-14 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-surface2">
        <Icon className="size-6 text-muted" />
      </div>
      <p className="font-semibold text-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "حدث خطأ غير متوقع",
  description,
  action
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger-bg/40 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
        <TriangleAlert className="size-6 text-danger" />
      </div>
      <p className="font-semibold text-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
