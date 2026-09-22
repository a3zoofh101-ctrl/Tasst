"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { ConfirmDialog } from "@/components/smm/ui/ConfirmDialog";
import { syncProviderServicesAction, toggleProviderActiveAction, refreshProviderBalanceAction } from "@/lib/smm/actions/admin-providers";

export function SyncServicesButton({ providerId }: { providerId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await syncProviderServicesAction(providerId);
          if (res.ok) toast.success(`تمت مزامنة ${res.count} خدمة`);
          else toast.error(res.error);
        })
      }
    >
      <RefreshCw className="size-4" />
      مزامنة الخدمات
    </Button>
  );
}

export function RefreshBalanceButton({ providerId }: { providerId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await refreshProviderBalanceAction(providerId);
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      <Wallet className="size-4" />
      تحديث الرصيد
    </Button>
  );
}

export function ToggleProviderButton({ providerId, active }: { providerId: string; active: boolean }) {
  const [pending, setPending] = useState(false);
  return (
    <ConfirmDialog
      trigger={
        <Button variant={active ? "danger" : "outline"} size="sm" loading={pending}>
          {active ? "تعطيل" : "تفعيل"}
        </Button>
      }
      title={active ? "تعطيل المزود" : "تفعيل المزود"}
      description="لن تُرسل طلبات جديدة إلى مزود معطّل."
      variant={active ? "danger" : "primary"}
      onConfirm={async () => {
        setPending(true);
        try {
          const res = await toggleProviderActiveAction(providerId);
          if (!res.ok) toast.error(res.error);
        } finally {
          setPending(false);
        }
      }}
    />
  );
}
