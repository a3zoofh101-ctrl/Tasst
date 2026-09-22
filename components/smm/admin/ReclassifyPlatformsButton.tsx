"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { reclassifyPlatformsPageAction, finalizeReclassifyRunAction } from "@/lib/smm/actions/admin-catalog";
import type { ReclassifySnapshotEntry } from "@/lib/smm/catalog-import";

export function ReclassifyPlatformsButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ scanned: number; moved: number } | null>(null);

  async function handleClick() {
    setPending(true);
    setProgress({ scanned: 0, moved: 0 });
    try {
      let cursor: string | null = null;
      let totalScanned = 0;
      let totalMoved = 0;
      const snapshot: ReclassifySnapshotEntry[] = [];
      const toastId = toast.loading("جاري فحص وإعادة تصنيف الخدمات...");

      // A large catalog (thousands of services) is processed a bounded
      // page at a time — see reclassifyPlatformsPageAction's comment —
      // so this loop can run for a while but each individual server
      // round-trip stays well within any function duration limit.
      for (;;) {
        const res = await reclassifyPlatformsPageAction(cursor);
        if (!res.ok) {
          toast.error(res.error, { id: toastId });
          return;
        }
        totalScanned += res.scanned ?? 0;
        totalMoved += res.moved ?? 0;
        if (res.snapshot) snapshot.push(...res.snapshot);
        setProgress({ scanned: totalScanned, moved: totalMoved });
        toast.loading(`تمت معالجة ${totalScanned} خدمة، نُقل منها ${totalMoved}...`, { id: toastId });

        if (!res.nextCursor) break;
        cursor = res.nextCursor;
      }

      if (totalMoved > 0) {
        await finalizeReclassifyRunAction({ moved: totalMoved, total: totalScanned, snapshot });
      }

      toast.success(`تم نقل ${totalMoved} خدمة لمنصتها وتصنيفها الصحيح (من أصل ${totalScanned})`, { id: toastId });
      router.refresh();
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} loading={pending}>
      <Wand2 className="size-4" />
      {pending && progress ? `جاري التصنيف... (${progress.scanned})` : "إعادة تصنيف المنصات والفئات تلقائيًا"}
    </Button>
  );
}
