"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DownloadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { bulkImportAllServicesAction } from "@/lib/smm/actions/admin-providers";

export function BulkImportDialog({ providerId }: { providerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [markup, setMarkup] = useState("0");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await bulkImportAllServicesAction(formData);
      if (res.ok) {
        toast.success(`تم استيراد ${res.imported} خدمة جديدة وتفعيلها (${res.skipped} كانت مستوردة مسبقًا من أصل ${res.total})`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <DownloadCloud className="size-4" />
          استيراد كل الخدمات تلقائيًا
        </Button>
      </DialogTrigger>
      <DialogContent
        title="استيراد كل خدمات المزوّد"
        description="يجلب الكتالوج الكامل ويفعّل كل خدمة فورًا بالهامش أدناه — بدون مراجعة يدوية لكل خدمة. مناسب للاستخدام الشخصي."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="providerId" value={providerId} />
          <div>
            <Label htmlFor="markupPercent">هامش الربح (%)</Label>
            <Input
              id="markupPercent"
              name="markupPercent"
              type="number"
              min={0}
              step="0.01"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted">0 = بيع بسعر التكلفة تمامًا (للاستخدام الشخصي)</p>
          </div>
          <Button type="submit" className="w-full" loading={pending}>
            استيراد وتفعيل الآن
          </Button>
          {pending && (
            <p className="text-center text-xs text-muted">
              قد يستغرق دقيقة أو أكثر حسب حجم الكتالوج — لا تغلق الصفحة. العملية آمنة لإعادة المحاولة.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
