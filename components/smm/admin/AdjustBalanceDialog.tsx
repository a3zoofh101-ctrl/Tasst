"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Textarea } from "@/components/smm/ui/Input";
import { adminAdjustBalanceAction } from "@/lib/smm/actions/admin-users";

export function AdjustBalanceDialog({ userId, direction }: { userId: string; direction: "CREDIT" | "DEBIT" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await adminAdjustBalanceAction(formData, direction);
      if (res.ok) {
        toast.success(direction === "CREDIT" ? "تم إضافة الرصيد" : "تم خصم الرصيد");
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
        <Button variant={direction === "CREDIT" ? "primary" : "danger"} size="sm">
          {direction === "CREDIT" ? <Plus className="size-4" /> : <Minus className="size-4" />}
          {direction === "CREDIT" ? "إضافة رصيد" : "خصم رصيد"}
        </Button>
      </DialogTrigger>
      <DialogContent title={direction === "CREDIT" ? "إضافة رصيد للمستخدم" : "خصم رصيد من المستخدم"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <Label htmlFor="amount">المبلغ (ر.س)</Label>
            <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
          </div>
          <div>
            <Label htmlFor="reason">السبب</Label>
            <Textarea id="reason" name="reason" required rows={2} placeholder="مثال: تعويض عن مشكلة تقنية" />
          </div>
          <Button type="submit" className="w-full" loading={pending} variant={direction === "CREDIT" ? "primary" : "danger"}>
            تأكيد
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
