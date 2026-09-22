"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { updateSettingsAction } from "@/lib/smm/actions/admin-settings";

export function SettingsForm({
  defaults
}: {
  defaults: { siteName: string; supportEmail: string; minDepositAmount: string; maxDepositAmount: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateSettingsAction(formData);
      if (res.ok) {
        toast.success("تم حفظ الإعدادات");
        router.refresh();
      } else toast.error(res.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="siteName">اسم المنصة</Label>
        <Input id="siteName" name="siteName" defaultValue={defaults.siteName} required />
      </div>
      <div>
        <Label htmlFor="supportEmail">بريد الدعم الفني</Label>
        <Input id="supportEmail" name="supportEmail" type="email" defaultValue={defaults.supportEmail} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minDepositAmount">الحد الأدنى للإيداع</Label>
          <Input id="minDepositAmount" name="minDepositAmount" type="number" min={1} defaultValue={defaults.minDepositAmount} required />
        </div>
        <div>
          <Label htmlFor="maxDepositAmount">الحد الأعلى للإيداع</Label>
          <Input id="maxDepositAmount" name="maxDepositAmount" type="number" min={1} defaultValue={defaults.maxDepositAmount} required />
        </div>
      </div>
      <Button type="submit" loading={pending}>
        حفظ الإعدادات
      </Button>
    </form>
  );
}
