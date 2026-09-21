"use client";

import Link from "next/link";
import { AuthCard } from "@/components/smm/auth/AuthCard";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { useServerAction } from "@/lib/smm/hooks/use-server-action";
import { registerAction } from "@/lib/smm/actions/auth";

export default function RegisterPage() {
  const { handleSubmit, pending, error } = useServerAction(registerAction);

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      description="ابدأ في طلب خدماتك خلال دقيقة واحدة"
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">الاسم الكامل</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required placeholder="اسمك الكامل" />
        </div>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">رقم الجوال (اختياري)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="05xxxxxxxx" />
        </div>
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="8 أحرف على الأقل" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="أعد كتابة كلمة المرور" />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          إنشاء الحساب
        </Button>

        <p className="text-center text-xs text-muted">
          بإنشائك للحساب فإنك توافق على{" "}
          <Link href="/smm/terms" className="underline">شروط الاستخدام</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
