"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/smm/ui/Input";
import { TICKET_TYPES } from "@/lib/smm/validation/support";
import { createTicketAction } from "@/lib/smm/actions/support";

export function NewTicketDialog({ orders }: { orders: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createTicketAction(formData);
      if (res && !res.ok) toast.error(res.error);
    } catch (err) {
      const digest = (err as { digest?: string } | undefined)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_")) throw err;
      toast.error("تعذّر إنشاء التذكرة");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          تذكرة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent title="فتح تذكرة دعم جديدة">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">العنوان</Label>
            <Input id="subject" name="subject" required placeholder="عنوان مختصر للمشكلة" />
          </div>
          <div>
            <Label htmlFor="type">نوع المشكلة</Label>
            <Select id="type" name="type" defaultValue="OTHER">
              {TICKET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          {orders.length > 0 && (
            <div>
              <Label htmlFor="orderId">الطلب المرتبط (اختياري)</Label>
              <Select id="orderId" name="orderId" defaultValue="">
                <option value="">بدون طلب محدد</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="message">تفاصيل المشكلة</Label>
            <Textarea id="message" name="message" required rows={4} placeholder="اشرح مشكلتك بالتفصيل..." />
          </div>
          <Button type="submit" className="w-full" loading={pending}>
            إرسال التذكرة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
