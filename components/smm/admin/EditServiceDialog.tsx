"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/smm/ui/Input";
import { updateServiceAction } from "@/lib/smm/actions/admin-services";

export type EditableService = {
  id: string;
  name: string;
  description: string | null;
  providerCost: string;
  markupType: "PERCENT" | "FIXED";
  markupValue: string;
  minQuantity: number;
  maxQuantity: number;
  refill: boolean;
  cancelSupported: boolean;
  averageTime: string | null;
};

export function EditServiceDialog({ service }: { service: EditableService }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [markupType, setMarkupType] = useState(service.markupType);
  const [markupValue, setMarkupValue] = useState(service.markupValue);

  const preview =
    markupType === "PERCENT"
      ? new Decimal(service.providerCost).times(new Decimal(1).plus(new Decimal(markupValue || 0).dividedBy(100))).toFixed(2)
      : new Decimal(service.providerCost).plus(markupValue || 0).toFixed(2);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateServiceAction(formData);
      if (res.ok) {
        toast.success("تم حفظ التعديلات");
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
          <Pencil className="size-4" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent title="تعديل الخدمة" className="max-w-lg">
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto smm-scrollbar pl-1">
          <input type="hidden" name="serviceId" value={service.id} />
          <div>
            <Label htmlFor="e-name">الاسم</Label>
            <Input id="e-name" name="name" defaultValue={service.name} required />
          </div>
          <div>
            <Label htmlFor="e-description">الوصف</Label>
            <Textarea id="e-description" name="description" defaultValue={service.description ?? ""} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="e-min">الحد الأدنى</Label>
              <Input id="e-min" name="minQuantity" type="number" defaultValue={service.minQuantity} required />
            </div>
            <div>
              <Label htmlFor="e-max">الحد الأعلى</Label>
              <Input id="e-max" name="maxQuantity" type="number" defaultValue={service.maxQuantity} required />
            </div>
          </div>
          <div>
            <Label htmlFor="e-time">الوقت المتوقع</Label>
            <Input id="e-time" name="averageTime" defaultValue={service.averageTime ?? ""} placeholder="مثال: 0-6 ساعات" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="e-markupType">نوع الهامش</Label>
              <Select id="e-markupType" name="markupType" value={markupType} onChange={(e) => setMarkupType(e.target.value as "PERCENT" | "FIXED")}>
                <option value="PERCENT">نسبة %</option>
                <option value="FIXED">مبلغ ثابت</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="e-markupValue">قيمة الهامش</Label>
              <Input id="e-markupValue" name="markupValue" type="number" min={0} step="0.01" value={markupValue} onChange={(e) => setMarkupValue(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="refill" defaultChecked={service.refill} className="size-4 accent-[--tw-color-brand-600]" />
              دعم Refill
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="cancelSupported" defaultChecked={service.cancelSupported} className="size-4" />
              دعم الإلغاء
            </label>
          </div>
          <div className="rounded-xl bg-surface2 p-3 text-sm">
            <p className="text-muted">تكلفة المزود: {service.providerCost} ر.س / 1000</p>
            <p className="font-bold text-fg">سعر البيع: {preview} ر.س / 1000</p>
          </div>
          <Button type="submit" className="w-full" loading={pending}>
            حفظ التعديلات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
