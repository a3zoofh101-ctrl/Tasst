import { ShieldCheck, Zap, Wallet, HeadphonesIcon, RefreshCw, LineChart } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "تنفيذ سريع", description: "معالجة فورية لأغلب الطلبات مع تتبع لحظي للتقدّم" },
  { icon: ShieldCheck, title: "أمان تام", description: "بياناتك ومدفوعاتك محمية بأعلى معايير الأمان" },
  { icon: Wallet, title: "محفظة رقمية", description: "أضف رصيدًا مرة واحدة واطلب أي خدمة بدون تعقيد" },
  { icon: RefreshCw, title: "ضمان Refill", description: "استرجاع تلقائي للخدمات المدعومة عند النقصان" },
  { icon: HeadphonesIcon, title: "دعم فني متجاوب", description: "فريق دعم جاهز للرد على استفساراتك بسرعة" },
  { icon: LineChart, title: "تقارير واضحة", description: "تابع طلباتك ومصروفاتك من لوحة تحكم واحدة" }
];

export function Features() {
  return (
    <section className="bg-surface2/40 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">مميزات المنصة</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">كل ما تحتاجه لإدارة تسويقك الرقمي بثقة</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="smm-glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-bold text-fg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
