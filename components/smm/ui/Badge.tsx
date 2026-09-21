import { cn } from "@/lib/smm/cn";
import type { OrderStatus, TicketStatus } from "@prisma/client";

const styles = {
  neutral: "bg-surface2 text-muted",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger"
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[tone],
        className
      )}
      {...props}
    />
  );
}

const orderStatusMap: Record<OrderStatus, { label: string; tone: keyof typeof styles }> = {
  PENDING: { label: "قيد الانتظار", tone: "neutral" },
  PROCESSING: { label: "جارٍ الإرسال", tone: "brand" },
  IN_PROGRESS: { label: "قيد التنفيذ", tone: "brand" },
  COMPLETED: { label: "مكتمل", tone: "success" },
  PARTIAL: { label: "منفّذ جزئيًا", tone: "warning" },
  CANCELED: { label: "ملغي", tone: "danger" },
  REFUNDED: { label: "مسترجَع", tone: "warning" }
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = orderStatusMap[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

const ticketStatusMap: Record<TicketStatus, { label: string; tone: keyof typeof styles }> = {
  OPEN: { label: "مفتوحة", tone: "warning" },
  ANSWERED: { label: "تم الرد", tone: "brand" },
  CLOSED: { label: "مغلقة", tone: "neutral" }
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const cfg = ticketStatusMap[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
