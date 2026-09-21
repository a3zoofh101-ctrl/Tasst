import { Navbar } from "@/components/smm/marketing/Navbar";
import { Footer } from "@/components/smm/marketing/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">سياسة الخصوصية</h1>
        <p className="mt-2 text-sm text-muted">آخر تحديث: {new Date().toLocaleDateString("ar-SA")}</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-fg">
          <section>
            <h2 className="text-lg font-bold">البيانات التي نجمعها</h2>
            <p className="mt-2 text-muted">الاسم، البريد الإلكتروني، رقم الجوال (اختياري)، وبيانات الطلبات والمعاملات المالية داخل المنصة فقط.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold">حماية البيانات</h2>
            <p className="mt-2 text-muted">
              يتم تشفير كلمات المرور بخوارزميات آمنة، ولا نقوم بتخزين بيانات بطاقات الدفع البنكية على خوادمنا في أي وقت.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold">مشاركة البيانات</h2>
            <p className="mt-2 text-muted">
              لا تتم مشاركة بياناتك مع أي طرف ثالث باستثناء ما يلزم لتنفيذ طلباتك (مثل إرسال الرابط والكمية لمزود الخدمة
              المختار)، أو ما يفرضه القانون.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
