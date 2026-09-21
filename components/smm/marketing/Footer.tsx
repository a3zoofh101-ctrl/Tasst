import Link from "next/link";
import { Logo } from "@/components/smm/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border2 bg-surface px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center sm:items-start">
            <Logo size="sm" />
            <p className="mt-2 max-w-xs text-center text-sm text-muted sm:text-right">منصة عربية لطلب وإدارة خدمات التسويق الرقمي والسوشيال ميديا</p>
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
