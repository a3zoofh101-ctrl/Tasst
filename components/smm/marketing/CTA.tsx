import Link from "next/link";
import { Button } from "@/components/smm/ui/Button";

export function CTA() {
  return (
    <section className="px-4 pb-14 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-4xl rounded-3xl bg-brand-600 px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">جاهز تبدأ؟</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-50 sm:text-base">
          أنشئ حسابك الآن وابدأ في طلب خدماتك الرقمية خلال دقائق
        </p>
        <Link href="/register">
          <Button size="lg" variant="secondary" className="mt-6 !bg-white !text-brand-700 hover:!bg-brand-50">
            إنشاء حساب مجانًا
          </Button>
        </Link>
      </div>
    </section>
  );
}
