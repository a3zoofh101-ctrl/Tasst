"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { rollbackLastReclassifyAction } from "@/lib/smm/actions/admin-catalog";

export function RollbackReclassifyButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await rollbackLastReclassifyAction();
      if (res.ok) {
        toast.success(`تم التراجع وإرجاع ${res.restored} خدمة لتصنيفها السابق`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} loading={pending}>
      <Undo2 className="size-4" />
      تراجع عن آخر إعادة تصنيف
    </Button>
  );
}
