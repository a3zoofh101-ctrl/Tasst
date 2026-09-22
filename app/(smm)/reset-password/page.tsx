"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/smm/auth/AuthCard";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { useServerAction } from "@/lib/smm/hooks/use-server-action";
import { resetPasswordAction } from "@/lib/smm/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { handleSubmit, pending, error, result } = useServerAction(resetPasswordAction);

  if (!token) {
    return (
      <AuthCard title="رابط غير صالح" description="رابط إعادة تعيين كلمة المرور مفقود أو غير صحيح.">
        <Link href="/forgot-password" className="block text-center text-sm font-semibold text-brand-600 hover:underline">
          طلب رابط جديد
        </Link>
      </AuthCard>
    );
  }

  if (result?.ok) {
    return (
      <AuthCard title="تم تحديث كلمة المرور" description="يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.">
        <Link href="/login" className="block text-center text-sm font-semibold text-brand-600 hover:underline">
          تسجيل الدخول
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="إعادة تعيين كلمة المرور" description="أدخل كلمة مرور جديدة لحسابك">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="8 أحرف على الأقل" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          تحديث كلمة المرور
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
