"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/smm/ui/ConfirmDialog";
import { Button } from "@/components/smm/ui/Button";
import { adminToggleUserActiveAction } from "@/lib/smm/actions/admin-users";

export function ToggleActiveButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant={isActive ? "danger" : "outline"} size="sm">
          {isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
        </Button>
      }
      title={isActive ? "تعطيل حساب المستخدم" : "تفعيل حساب المستخدم"}
      description={isActive ? "لن يتمكن المستخدم من تسجيل الدخول بعد التعطيل." : "سيتمكن المستخدم من تسجيل الدخول مجددًا."}
      variant={isActive ? "danger" : "primary"}
      onConfirm={async () => {
        const res = await adminToggleUserActiveAction(userId);
        if (!res.ok) toast.error(res.error);
      }}
    />
  );
}
