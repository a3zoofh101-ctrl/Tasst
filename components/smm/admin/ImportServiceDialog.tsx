"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Select } from "@/components/smm/ui/Input";
import { importProviderServiceAction } from "@/lib/smm/actions/admin-services";

export function ImportServiceDialog({
  providerServiceId,
  suggestedName,
  providerRate,
  platforms
}: {
  providerServiceId: string;
  suggestedName: string;
  providerRate: string;
  platforms: { id: string; name: string; categories: { id: string; name: string }[] }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [markupType, setMarkupType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [markupValue, setMarkupValue] = useState("100");

  const categories = platforms.find((p) => p.id === platformId)?.categories ?? [];
  const preview =
    markupType === "PERCENT"
      ? new Decimal(providerRate).times(new Decimal(1).plus(new Decimal(markupValue || 0).dividedBy(100))).toFixed(2)
      : new Decimal(providerRate).plus(markupValue || 0).toFixed(2);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await importProviderServiceAction(formData);
      if (res.ok) {
        toast.success("تم استيراد الخدمة (غير مفعّلة بعد)");
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="size-4" />
          استيراد
        </Button>
      </DialogTrigger>
      <DialogContent title="استيراد خدمة من المزود" description="ستكون الخدمة غير مفعّلة حتى تراجعها">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="providerServiceId" value={providerServiceId} />
          <div>
            <Label htmlFor="name">اسم الخدمة</Label>
            <Input id="name" name="name" defaultValue={suggestedName} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="platformId">المنصة</Label>
              <Select id="platformId" name="platformId" value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryId">التصنيف</Label>
              <Select id="categoryId" name="categoryId" required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="markupType">نوع الهامش</Label>
              <Select id="markupType" name="markupType" value={markupType} onChange={(e) => setMarkupType(e.target.value as "PERCENT" | "FIXED")}>
                <option value="PERCENT">نسبة %</option>
                <option value="FIXED">مبلغ ثابت</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="markupValue">قيمة الهامش</Label>
              <Input id="markupValue" name="markupValue" type="number" min={0} step="0.01" value={markupValue} onChange={(e) => setMarkupValue(e.target.value)} />
            </div>
          </div>
          <div className="rounded-xl bg-surface2 p-3 text-sm">
            <p className="text-muted">تكلفة المزود: {providerRate} ر.س / 1000</p>
            <p className="font-bold text-fg">سعر البيع المقترح: {preview} ر.س / 1000</p>
          </div>
          <Button type="submit" className="w-full" loading={pending}>
            استيراد الخدمة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
