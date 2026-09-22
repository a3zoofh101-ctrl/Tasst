"use client";

import Link from "next/link";
import { AuthCard } from "@/components/smm/auth/AuthCard";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label } from "@/components/smm/ui/Input";
import { useServerAction } from "@/lib/smm/hooks/use-server-action";
import { loginAction } from "@/lib/smm/actions/auth";

export default function LoginPage() {
  const { handleSubmit, pending, error } = useServerAction(loginAction);

  return (
    <AuthCard
      title="تسجيل الدخول"
      description="أدخل بياناتك للوصول إلى لوحة التحكم"
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            إنشاء حساب جديد
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">كلمة المرور</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          تسجيل الدخول
        </Button>
      </form>
    </AuthCard>
  );
}
