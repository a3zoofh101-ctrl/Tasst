"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Label } from "@/components/smm/ui/Input";
import { Button } from "@/components/smm/ui/Button";
import { changePasswordAction } from "@/lib/smm/actions/auth";

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const res = await changePasswordAction(formData);
      if (res.ok) {
        toast.success("تم تغيير كلمة المرور، تم تسجيل خروجك من الأجهزة الأخرى");
        form.reset();
      } else {
        toast.error(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
          <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        </div>
      </div>
      <Button type="submit" loading={pending}>
        تغيير كلمة المرور
      </Button>
    </form>
  );
}
