"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { depositAction } from "@/lib/smm/actions/wallet";

const QUICK_AMOUNTS = [50, 100, 250, 500];

export function DepositDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("amount", amount);
      const res = await depositAction(formData);
      if (res.ok) {
        toast.success("تم إضافة الرصيد بنجاح");
        setOpen(false);
        setAmount("");
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
        <Button>
          <Wallet className="size-4" />
          إضافة رصيد
        </Button>
      </DialogTrigger>
      <DialogContent title="إضافة رصيد" description="سيُستخدم مزود دفع تجريبي حاليًا. الدفع الحقيقي (مدى/فيزا/ماستركارد/آبل باي) قادم قريبًا.">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className="rounded-xl border border-border2 py-2 text-sm font-semibold text-fg hover:border-brand-500 hover:text-brand-600"
              >
                {a} ر.س
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="amount">المبلغ (ر.س)</Label>
            <Input id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                إلغاء
              </Button>
            </DialogClose>
            <Button loading={pending} disabled={!amount || Number(amount) <= 0} onClick={submit}>
              تأكيد الإيداع
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
