"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { reclassifyPlatformsAction } from "@/lib/smm/actions/admin-catalog";

export function ReclassifyPlatformsButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await reclassifyPlatformsAction();
      if (res.ok) {
        toast.success(`تم نقل ${res.moved} خدمة لمنصتها وتصنيفها الصحيح (من أصل ${res.total})`);
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
      <Wand2 className="size-4" />
      إعادة تصنيف المنصات والفئات تلقائيًا
    </Button>
  );
}
