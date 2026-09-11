"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cx } from "@/lib/utils";

export default function AccountPage() {
  const { locale } = useParams<{ locale: Locale }>();
  const dict = getDictionary(locale);
  const [mode, setMode] = useState<"login" | "register">("login");
  const isAr = locale === "ar";

  const copy = {
    login: isAr ? "تسجيل الدخول" : "Sign In",
    register: isAr ? "حساب جديد" : "Create Account",
    email: isAr ? "البريد الإلكتروني" : "Email",
    phone: isAr ? "رقم الجوال" : "Mobile Number",
    password: isAr ? "كلمة المرور" : "Password",
    name: isAr ? "الاسم الكامل" : "Full Name",
    submitLogin: isAr ? "دخول" : "Sign In",
    submitRegister: isAr ? "إنشاء الحساب" : "Create Account",
    switchToRegister: isAr ? "ليس لديك حساب؟ سجّل الآن" : "Don't have an account? Register",
    switchToLogin: isAr ? "لديك حساب بالفعل؟ سجّل الدخول" : "Already have an account? Sign in"
  };

  return (
    <div className="container-x section-y max-w-md">
      <div className="flex items-center gap-2 mb-8 bg-sand/60 rounded-full p-1">
        <button
          onClick={() => setMode("login")}
          className={cx(
            "flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors",
            mode === "login" ? "bg-ink text-cream" : "text-ink/60"
          )}
        >
          {copy.login}
        </button>
        <button
          onClick={() => setMode("register")}
          className={cx(
            "flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors",
            mode === "register" ? "bg-ink text-cream" : "text-ink/60"
          )}
        >
          {copy.register}
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {mode === "register" && <input required placeholder={copy.name} className="input-field" />}
        <input required type="email" placeholder={copy.email} className="input-field" />
        {mode === "register" && <input required type="tel" placeholder={copy.phone} className="input-field" />}
        <input required type="password" placeholder={copy.password} className="input-field" />
        <button type="submit" className="btn-primary w-full">
          {mode === "login" ? copy.submitLogin : copy.submitRegister}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="block w-full text-center text-sm text-gold-dark mt-5"
      >
        {mode === "login" ? copy.switchToRegister : copy.switchToLogin}
      </button>
    </div>
  );
}
