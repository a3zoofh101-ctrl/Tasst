"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/smm/ui/Button";
import { toggleServiceActiveAction } from "@/lib/smm/actions/admin-services";

export function ToggleServiceButton({ serviceId, active }: { serviceId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={active ? "danger" : "primary"}
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleServiceActiveAction(serviceId);
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      {active ? "إخفاء" : "تفعيل"}
    </Button>
  );
}
