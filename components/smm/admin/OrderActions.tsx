"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCw, RefreshCw } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { adminQueryOrderStatusAction, adminRetryOrderAction } from "@/lib/smm/actions/admin-orders";

export function QueryStatusButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminQueryOrderStatusAction(orderId);
          if (res.ok) toast.success("تم تحديث حالة الطلب");
          else toast.error(res.error);
        })
      }
    >
      <RefreshCw className="size-4" />
      استعلام عن الحالة
    </Button>
  );
}

export function RetryOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminRetryOrderAction(orderId);
          if (res.ok) toast.success("تمت إعادة إرسال الطلب بنجاح");
          else toast.error(res.error);
        })
      }
    >
      <RotateCw className="size-4" />
      إعادة المحاولة
    </Button>
  );
}
