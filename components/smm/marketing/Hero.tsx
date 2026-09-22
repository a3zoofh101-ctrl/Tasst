import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Wallet } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-canvas px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
      <div className="smm-mesh" />

      <div className="mx-auto max-w-3xl text-center">
        <span className="animate-fadeUp inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
          <Zap className="size-3.5" /> منصة عربية لإدارة خدمات التسويق الرقمي
        </span>

        <h1 className="animate-fadeUp mt-6 text-3xl font-extrabold leading-tight text-fg sm:text-5xl [animation-delay:80ms]">
          كل خدماتك الرقمية{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">من مكان واحد</span>
        </h1>

        <p className="animate-fadeUp mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg [animation-delay:160ms]">
          اطلب خدمات التسويق الرقمي ومنصات التواصل الاجتماعي بسهولة وسرعة، مع أسعار شفافة، محفظة رقمية آمنة، وتتبع لحظي لحالة كل طلب.
        </p>

        <div className="animate-fadeUp mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:240ms]">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full animate-glowPulse sm:w-auto">
              ابدأ الآن
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <a href="#services" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              استعراض الخدمات
            </Button>
          </a>
        </div>

        <div className="animate-fadeUp mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 text-xs text-muted sm:text-sm [animation-delay:320ms]">
          <Feature icon={ShieldCheck} label="دفع وتنفيذ آمن" />
          <Feature icon={Zap} label="تنفيذ سريع" />
          <Feature icon={Wallet} label="محفظة رقمية موثوقة" />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="smm-glass flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-transform duration-300 hover:-translate-y-0.5">
      <Icon className="size-4 text-brand-600 dark:text-brand-300" />
      <span className="font-medium text-fg">{label}</span>
    </div>
  );
}
