import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border2 bg-surface px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-right">
            <Link href="/smm" className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles className="size-4" />
              </span>
              <span className="text-base font-extrabold text-fg">تَسّت</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted">منصة عربية لطلب وإدارة خدمات التسويق الرقمي والسوشيال ميديا</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <a href="#services" className="hover:text-fg">الخدمات</a>
            <a href="#faq" className="hover:text-fg">الأسئلة الشائعة</a>
            <Link href="/smm/terms" className="hover:text-fg">شروط الاستخدام</Link>
            <Link href="/smm/privacy" className="hover:text-fg">سياسة الخصوصية</Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">© {new Date().getFullYear()} تَسّت. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
