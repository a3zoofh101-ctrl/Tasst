import { UserPlus, Search, CreditCard, Rocket } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "أنشئ حسابك", description: "سجّل خلال دقيقة واحدة بالبريد الإلكتروني ورقم جوالك" },
  { icon: Search, title: "اختر الخدمة", description: "تصفّح مئات الخدمات المصنّفة حسب المنصة والفئة" },
  { icon: CreditCard, title: "أضف رصيدًا", description: "اشحن محفظتك بأمان وادفع فقط مقابل ما تطلبه" },
  { icon: Rocket, title: "تابع طلبك", description: "راقب تقدّم طلبك لحظيًا حتى اكتماله بالكامل" }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">كيف تعمل المنصة؟</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">أربع خطوات بسيطة تفصلك عن أول طلب</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border2 bg-surface p-5">
              <span className="absolute -top-3 right-5 flex size-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-glow">
                {i + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-bold text-fg">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
