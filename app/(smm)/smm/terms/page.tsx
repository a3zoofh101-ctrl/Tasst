import { Navbar } from "@/components/smm/marketing/Navbar";
import { Footer } from "@/components/smm/marketing/Footer";
import { formatDate } from "@/lib/smm/date";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">شروط الاستخدام</h1>
        <p className="mt-2 text-sm text-muted">آخر تحديث: {formatDate(new Date())}</p>

        <div className="prose-smm mt-8 space-y-6 text-sm leading-7 text-fg">
          <section>
            <h2 className="text-lg font-bold">1. طبيعة الخدمة</h2>
            <p className="mt-2 text-muted">
              منصة بوست هي وسيط تقني يتيح لك طلب وإدارة خدمات التسويق الرقمي عبر منصات التواصل الاجتماعي المختلفة، عن طريق
              مزودي خدمات خارجيين. المنصة لا تملك أو تدير حسابات التواصل الاجتماعي الخاصة بك.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">2. الاستخدام المقبول</h2>
            <p className="mt-2 text-muted">يمنع منعًا باتًا استخدام المنصة في أي من الأغراض التالية:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
              <li>الاحتيال أو انتحال شخصية الغير</li>
              <li>مضايقة أو تهديد أشخاص آخرين</li>
              <li>إرسال محتوى غير مرغوب فيه (سبام)</li>
              <li>التلاعب السياسي أو الانتخابي</li>
              <li>أي نشاط يخالف القوانين المعمول بها أو شروط استخدام المنصات المستهدفة</li>
            </ul>
            <p className="mt-2 text-muted">
              تحتفظ إدارة المنصة بحق تعطيل أو إخفاء أي خدمة، وتعليق أو إغلاق أي حساب يُثبت مخالفته لهذه الشروط دون إشعار مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">3. المحفظة والمدفوعات</h2>
            <p className="mt-2 text-muted">
              يتم خصم قيمة الطلبات من رصيد محفظتك داخل المنصة. في حال تعذّر تنفيذ طلب لأي سبب تقني من جانب مزود الخدمة، يُعاد
              المبلغ المدفوع بالكامل إلى محفظتك تلقائيًا.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">4. حدود المسؤولية</h2>
            <p className="mt-2 text-muted">
              تبذل المنصة جهدًا معقولًا لضمان جودة الخدمات المقدَّمة، إلا أنها غير مسؤولة عن أي تغييرات تطرأ على سياسات
              المنصات الاجتماعية المستهدفة أو عن نتائج استخدامك للخدمة خارج نطاق التنفيذ الفني للطلب.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">5. التواصل</h2>
            <p className="mt-2 text-muted">لأي استفسار بخصوص هذه الشروط، يمكنك التواصل معنا عبر قسم الدعم الفني داخل لوحة التحكم.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
