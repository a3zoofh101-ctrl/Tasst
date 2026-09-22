"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/smm/cn";
import { OrderStatusBadge, orderStatusMap } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { Button } from "@/components/smm/ui/Button";
import { Input } from "@/components/smm/ui/Input";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";

export type OrderRow = {
  id: string;
  orderNumber: string;
  serviceName: string;
  link: string;
  quantity: string;
  price: string;
  remains: string;
  status: OrderStatus;
  date: string;
};

const STATUS_TABS: OrderStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS", "COMPLETED", "PARTIAL", "CANCELED", "REFUNDED"];

// Client-side filter tabs + search over the order history — same idea as
// the status tabs / search box on the provider's own order-history page,
// applied to our own table/badges instead of copying their look.
export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return o.orderNumber.toLowerCase().includes(q) || o.serviceName.toLowerCase().includes(q) || o.link.toLowerCase().includes(q);
    });
  }, [orders, status, query]);

  if (orders.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="لا توجد طلبات بعد"
          description="ابدأ بطلب أول خدمة لك الآن"
          action={
            <Link href="/dashboard/new-order">
              <Button size="sm">طلب جديد</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatus("ALL")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            status === "ALL" ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
          )}
        >
          الكل
        </button>
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              status === s ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
            )}
          >
            {orderStatusMap[s].label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث برقم الطلب أو اسم الخدمة أو الرابط..." className="pr-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد طلبات مطابقة" description="جرّب تغيير الفلتر أو كلمات البحث" />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>رقم الطلب</Th>
              <Th>الخدمة</Th>
              <Th>الرابط</Th>
              <Th>الكمية</Th>
              <Th>السعر</Th>
              <Th>المتبقي</Th>
              <Th>الحالة</Th>
              <Th>التاريخ</Th>
            </Tr>
          </Thead>
          <tbody>
            {filtered.map((o) => (
              <Tr key={o.id}>
                <Td>
                  <Link href={`/dashboard/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                    {o.orderNumber}
                  </Link>
                </Td>
                <Td className="max-w-[180px] truncate">{o.serviceName}</Td>
                <Td className="max-w-[160px] truncate text-xs text-muted">{o.link}</Td>
                <Td>{o.quantity}</Td>
                <Td>{o.price}</Td>
                <Td>{o.remains}</Td>
                <Td>
                  <OrderStatusBadge status={o.status} />
                </Td>
                <Td className="text-xs text-muted">{o.date}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
