import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Wallet } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-canvas px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
      <div className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.brand.100),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.brand.900),transparent)]" />

      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
          <Zap className="size-3.5" /> منصة عربية لإدارة خدمات التسويق الرقمي
        </span>

        <h1 className="mt-6 text-3xl font-extrabold leading-tight text-fg sm:text-5xl">
          كل خدماتك الرقمية{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">من مكان واحد</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
          اطلب خدمات التسويق الرقمي ومنصات التواصل الاجتماعي بسهولة وسرعة، مع أسعار شفافة، محفظة رقمية آمنة، وتتبع لحظي لحالة كل طلب.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
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

        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 text-xs text-muted sm:text-sm">
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
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border2 bg-surface p-3">
      <Icon className="size-4 text-brand-600" />
      <span className="font-medium text-fg">{label}</span>
    </div>
  );
}
