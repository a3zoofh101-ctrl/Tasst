"use client";

import Link from "next/link";
import { AuthCard } from "@/components/smm/auth/AuthCard";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { useServerAction } from "@/lib/smm/hooks/use-server-action";
import { forgotPasswordAction } from "@/lib/smm/actions/auth";

export default function ForgotPasswordPage() {
  const { handleSubmit, pending, error, result } = useServerAction(forgotPasswordAction);

  if (result?.ok) {
    return (
      <AuthCard title="تحقق من بريدك الإلكتروني" description="إذا كان البريد مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.">
        {result.devResetLink && (
          <div className="rounded-lg border border-warning/30 bg-warning-bg/60 px-3 py-2.5 text-sm text-fg">
            <p className="mb-1 font-semibold">وضع التطوير: لا يوجد مزود بريد إلكتروني مُفعّل بعد</p>
            <Link href={result.devResetLink} className="font-semibold text-brand-600 underline">
              اضغط هنا لإعادة تعيين كلمة المرور
            </Link>
          </div>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-brand-600 hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="نسيت كلمة المرور؟"
      description="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          العودة لتسجيل الدخول
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          إرسال رابط إعادة التعيين
        </Button>
      </form>
    </AuthCard>
  );
}
