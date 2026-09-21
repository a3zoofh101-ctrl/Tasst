import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "كم يستغرق تنفيذ الطلب؟", a: "يختلف الوقت حسب نوع الخدمة، ويظهر الوقت المتوقع لكل خدمة قبل الطلب مباشرة، وتتراوح أغلب الطلبات بين دقائق وساعات قليلة." },
  { q: "هل يمكنني استرجاع المبلغ إذا فشل الطلب؟", a: "نعم، في حال تعذّر تنفيذ الطلب يتم استرجاع المبلغ إلى محفظتك تلقائيًا دون الحاجة للتواصل مع الدعم." },
  { q: "ما طرق إضافة الرصيد المتاحة؟", a: "نعمل حاليًا على تفعيل وسائل الدفع المحلية مثل مدى وآبل باي وبطاقات فيزا وماستركارد عبر مزود دفع رسمي." },
  { q: "هل بياناتي وبيانات حسابي آمنة؟", a: "نستخدم تشفيرًا قويًا لكلمات المرور والبيانات الحساسة، ولا نطلب أو نخزّن بيانات بطاقتك البنكية على خوادمنا." },
  { q: "هل يمكنني إلغاء طلب بعد إرساله؟", a: "بعض الخدمات تدعم الإلغاء أو الاسترجاع (Refill)، ويظهر ذلك بوضوح في تفاصيل كل خدمة." }
];

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">الأسئلة الشائعة</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">إجابات على أكثر الأسئلة تكرارًا</p>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border2 bg-surface p-4 open:pb-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-fg">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
