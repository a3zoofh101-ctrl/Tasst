"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Percent } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { applyBulkMarkupPageAction, finalizeBulkMarkupRunAction } from "@/lib/smm/actions/admin-pricing";
import type { MarkupSnapshotEntry } from "@/lib/smm/pricing-bulk";

export function ApplyBulkMarkupButton() {
  const router = useRouter();
  const [markupPercent, setMarkupPercent] = useState("30");
  const [onlyZeroMargin, setOnlyZeroMargin] = useState(true);
  const [pending, setPending] = useState(false);

  async function handleApply() {
    const percent = Number(markupPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 1000) {
      toast.error("أدخل نسبة صحيحة بين 0 و 1000");
      return;
    }

    setPending(true);
    const toastId = toast.loading("جاري تطبيق هامش الربح...");
    try {
      let cursor: string | null = null;
      let totalScanned = 0;
      let totalUpdated = 0;
      const snapshot: MarkupSnapshotEntry[] = [];

      // Bounded per-page round trips — see admin-pricing.ts's comment —
      // so this stays safe regardless of catalog size.
      for (;;) {
        const res = await applyBulkMarkupPageAction(cursor, percent, onlyZeroMargin);
        if (!res.ok) {
          toast.error(res.error, { id: toastId });
          return;
        }
        totalScanned += res.scanned ?? 0;
        totalUpdated += res.updated ?? 0;
        if (res.snapshot) snapshot.push(...res.snapshot);
        toast.loading(`تمت معالجة ${totalScanned} خدمة، حُدّث سعر ${totalUpdated} منها...`, { id: toastId });

        if (!res.nextCursor) break;
        cursor = res.nextCursor;
      }

      if (totalUpdated > 0) {
        await finalizeBulkMarkupRunAction({ updated: totalUpdated, total: totalScanned, markupPercent: percent, snapshot });
      }

      toast.success(`تم تحديث سعر ${totalUpdated} خدمة بهامش ربح %${percent} (من أصل ${totalScanned} تم فحصها)`, { id: toastId });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Percent className="size-4" />
          تحديد هامش ربح بالجملة
        </Button>
      </DialogTrigger>
      <DialogContent
        title="تحديد هامش ربح بالجملة"
        description="يطبّق نسبة مئوية فوق تكلفة المزود ويعيد حساب سعر البيع تلقائيًا. السعر الحالي والتكلفة يبقيان كما هما لأي خدمة لا تندرج ضمن النطاق المحدد."
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="markupPercent">نسبة هامش الربح (%)</Label>
            <div className="relative">
              <Input
                id="markupPercent"
                type="number"
                min={0}
                max={1000}
                step="0.5"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
              />
              <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </div>
            <p className="mt-1 text-xs text-muted">مثال: %30 يعني بيع الخدمة بسعر يزيد 30% عن تكلفة المزود.</p>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-border2 p-3 text-sm">
            <input
              type="checkbox"
              checked={onlyZeroMargin}
              onChange={(e) => setOnlyZeroMargin(e.target.checked)}
              className="mt-0.5 size-4 accent-brand-600"
            />
            <span>
              <span className="font-semibold text-fg">تطبيق فقط على الخدمات بدون هامش حاليًا (موصى به)</span>
              <br />
              <span className="text-xs text-muted">لا يلمس أي خدمة عدّلت هامشها يدويًا من قبل. أزل التحديد لتطبيقه على كل الخدمات المستوردة.</span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                إلغاء
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button loading={pending} onClick={handleApply}>
                تطبيق الهامش
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
