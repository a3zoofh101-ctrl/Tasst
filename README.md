# تَسّت — منصة إدارة خدمات التسويق الرقمي

منصة عربية (Next.js + TypeScript + PostgreSQL + Prisma) لطلب وإدارة خدمات التسويق الرقمي والسوشيال ميديا: محفظة رقمية، طلبات، مزودي خدمات (Provider API)، لوحة إدارة كاملة، ومزامنة حالة الطلبات عبر Cron.

> ملاحظة: هذا المستودع يحتوي أيضًا على مشاريع تجريبية أخرى غير مرتبطة (متجر عطور `/`, موقع بلدية `/baladiya`, لعبة `/moqnaas`). منصة تَسّت تعيش تحت المسارات `/smm`, `/login`, `/register`, `/dashboard/*`, `/admin/*` ولا تتداخل معها.

## التقنيات المستخدمة

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS** (Design System مخصص، Dark/Light Mode)
- **PostgreSQL** + **Prisma ORM**
- مصادقة مخصّصة: **bcryptjs** (تشفير كلمات المرور) + **jose** (JWT في Cookies آمنة) + جلسات قابلة للإلغاء في قاعدة البيانات
- **Zod** للتحقق من البيانات على السيرفر (لا يوجد سعر أو صلاحية يُوثق بها من الـ Frontend)
- **React Hook Form**-compatible forms عبر Server Actions
- **Radix UI** (Dialog, Dropdown Menu) + **sonner** (Toast) + **lucide-react** (Icons)
- **Vitest** للاختبارات

## البنية العامة

```
app/(smm)/            صفحات المنصة (Route Group بدون تأثير على المسارات)
  smm/                 الصفحة الرئيسية (Landing) + الشروط + الخصوصية
  login, register, forgot-password, reset-password
  dashboard/           لوحة العميل (خدمات، طلب جديد، طلباتي، المحفظة، الدعم)
  admin/               لوحة الإدارة (مستخدمون، طلبات، خدمات، مزودون، تصنيفات...)
app/api/cron/orders/   مزامنة حالة الطلبات (محمي بـ CRON_SECRET)
lib/smm/
  db/prisma.ts         Prisma Client singleton
  auth/                تشفير كلمات المرور، JWT، التشفير، الجلسات
  providers/           Provider Adapter الموحّد + Mock + Generic
  wallet.ts            محرّك المحفظة الآمن (بدون Race Conditions)
  orders.ts            منطق إنشاء الطلب: تحقق → خصم → إرسال → Rollback عند الفشل
  order-sync.ts         مزامنة حالة الطلبات من المزود (يُستخدم من الـ Cron ولوحة الإدارة)
  actions/              Server Actions (auth, orders, wallet, support, admin-*)
  validation/            Zod schemas
prisma/schema.prisma    مخطط قاعدة البيانات الكامل
prisma/seed.ts          بيانات تجريبية (منصات، خدمات، أدمن، عميل تجريبي)
```

## 1) التثبيت

```bash
npm install
```

## 2) إعداد PostgreSQL

أي قاعدة PostgreSQL تعمل (محليًا أو عبر Docker). مثال محليًا:

```bash
sudo -u postgres psql -c "CREATE USER tasst_smm WITH PASSWORD 'your-password' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE tasst_smm OWNER tasst_smm;"
```

## 3) إعداد Environment Variables

انسخ `.env.example` إلى `.env` واملأ القيم:

```bash
cp .env.example .env
```

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط اتصال PostgreSQL |
| `AUTH_SECRET` | مفتاح توقيع JWT — 32 حرفًا على الأقل (`openssl rand -hex 32`) |
| `ENCRYPTION_KEY` | مفتاح AES-256 لتشفير مفاتيح API الخاصة بالمزودين — 64 حرف hex (`openssl rand -hex 32`) |
| `CRON_SECRET` | مفتاح سري لحماية `/api/cron/orders` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | يُستخدمان فقط في `prisma/seed.ts` لإنشاء أول حساب مدير — **لا تُستخدم في الكود مباشرة ولا تُرفع لأي مكان عام** |

## 4) Prisma Migrate

```bash
npx prisma migrate deploy   # في بيئة جاهزة (production) — يطبّق الهجرات الموجودة في prisma/migrations
# أو أثناء التطوير المحلي فقط:
npx prisma migrate dev
```

## 5) تشغيل الـ Seed

```bash
npx prisma db seed
```

ينشئ: 6 منصات (X، إنستغرام، تيك توك، يوتيوب، سناب شات، تيليجرام) مع تصنيفاتها، مزوّد تجريبي (Mock) و11 خدمة فعّالة، حساب مدير من `ADMIN_EMAIL`/`ADMIN_PASSWORD`، وحساب عميل تجريبي (`demo@tasst.local` / `Demo1234!`) برصيد ترحيبي 500 ر.س.

## 6) التشغيل في وضع التطوير

```bash
npm run dev
```

- الصفحة الرئيسية للمنصة: `http://localhost:3000/smm`
- تسجيل الدخول: `http://localhost:3000/login`
- لوحة العميل: `http://localhost:3000/dashboard`
- لوحة الإدارة: `http://localhost:3000/admin`

## 7) البناء والتشغيل في الإنتاج

```bash
npm run build
npm run start
```

قبل النشر تأكّد من:
- `npx prisma migrate deploy` على قاعدة بيانات الإنتاج
- ضبط جميع Environment Variables (أسرار مختلفة عن التطوير)
- تفعيل HTTPS (الكوكيز تُضبط كـ `secure` تلقائيًا في `NODE_ENV=production`)

## 8) ربط مزوّد خدمات SMM حقيقي (Provider API)

من لوحة الإدارة → **المزودون** → **إضافة مزود**:

1. اختر النوع **Generic** (يدعم الصيغة الشائعة: `action=services|add|status|balance|cancel|refill`)
2. أدخل رابط الـ API الخاص بالمزوّد ومفتاح الـ API (يُشفَّر بـ AES-256-GCM قبل التخزين في قاعدة البيانات ولا يُرسل للمتصفح أبدًا)

إذا كان المزوّد يستخدم صيغة مختلفة (حقول أخرى، مصادقة مختلفة...)، عدّل `lib/smm/providers/generic.ts` أو أنشئ Adapter جديدًا يطبّق الواجهة الموحّدة في `lib/smm/providers/types.ts` (`getServices`, `getBalance`, `createOrder`, `getOrderStatus`, `refillOrder`, `cancelOrder`) وأضفه في `lib/smm/providers/factory.ts`.

## 9) مزامنة الخدمات

من **المزودون** اضغط **"مزامنة الخدمات"** — يجلب كتالوج المزوّد ويحفظه كـ `ProviderService` (لا يظهر للعملاء تلقائيًا). من صفحة **الخدمات** في لوحة الإدارة، استورد كل خدمة مع تحديد المنصة/التصنيف وهامش الربح (نسبة % أو مبلغ ثابت) — تبقى الخدمة **غير مفعّلة** حتى يفعّلها المدير يدويًا.

## 10) مزامنة حالة الطلبات (Cron)

نقطة النهاية `GET /api/cron/orders` محمية بـ `CRON_SECRET` (عبر `Authorization: Bearer <secret>` أو `?secret=<secret>`). مثال جدولة كل 5 دقائق:

```bash
*/5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/orders
```

أو عبر Vercel Cron / systemd timer / GitHub Actions حسب بيئة النشر.

## 11) الدفع (مدى / فيزا / ماستركارد / آبل باي)

يوجد `PaymentProvider` interface (`lib/smm/payments/types.ts`) و`getPaymentProvider()` (`lib/smm/payments/index.ts`) يختار المزوّد تلقائيًا:

- **بدون `MOYASAR_SECRET_KEY`** (الوضع الافتراضي محليًا): يُستخدم `MockPaymentProvider` — إيداع فوري وهمي لأغراض التطوير والاختبار.
- **بوجود `MOYASAR_SECRET_KEY`**: يُستخدم `MoyasarPaymentProvider` (`lib/smm/payments/moyasar.ts`) — تكامل حقيقي مع [Moyasar](https://moyasar.com)، وهو مزوّد دفع مرخّص من ساما يدعم مدى وفيزا وماستركارد وآبل باي.

**كيف يعمل التدفق الحقيقي:**
1. `depositAction` (`lib/smm/actions/wallet.ts`) ينشئ Invoice عند Moyasar ويحوّل العميل لصفحة الدفع المستضافة لديهم (بياناته البنكية لا تلمس خادمنا إطلاقًا).
2. بعد الدفع، يعود العميل عبر `GET /api/payments/moyasar/callback` — للتجربة الفورية فقط.
3. بالتوازي، يرسل Moyasar Webhook إلى `POST /api/payments/moyasar/webhook?token=<MOYASAR_WEBHOOK_SECRET>` — هذا هو المسار الموثوق (يعمل حتى لو أغلق العميل المتصفح).
4. كلا المسارين ينتهيان عند `completeRedirectDeposit()` (`lib/smm/payments/complete.ts`) الذي **يعيد التحقق من الحالة الحقيقية مباشرة من Moyasar API** (لا يثق بالـ webhook body ولا بـ query string القادم من المتصفح إطلاقًا)، ثم يُضيف الرصيد مرة واحدة فقط بشكل آمن تزامنيًا (Conditional Update يمنع الإضافة المزدوجة إذا وصل الـ Webhook والـ Callback في نفس اللحظة).

**للتفعيل الفعلي:**
1. أنشئ حسابًا في [dashboard.moyasar.com](https://dashboard.moyasar.com) واحصل على مفتاح Sandbox (`sk_test_...`)
2. أضف في `.env`: `APP_URL`, `MOYASAR_SECRET_KEY`, `MOYASAR_WEBHOOK_SECRET` (تختاره أنت)
3. سجّل رابط الـ Webhook في لوحة Moyasar: `https://your-domain.com/api/payments/moyasar/webhook?token=<MOYASAR_WEBHOOK_SECRET>`
4. اختبر ببطاقات Sandbox من [docs.moyasar.com/testing](https://docs.moyasar.com/testing)
5. عند الانتقال للإنتاج، استبدل المفتاح بمفتاح حي (`sk_live_...`) فقط — لا تغيير آخر في الكود مطلوب

لا تُخزَّن بيانات بطاقات بنكية على الخادم في أي وقت — تشتري صفحة الدفع المستضافة عند Moyasar ذلك بالكامل.

## 12) الاختبارات

```bash
npm run test
```

تغطي: حساب السعر، خصم/إيداع/استرجاع المحفظة تحت التزامن، منع الطلب المكرر (Idempotency)، فشل المزود والاسترجاع التلقائي، صلاحيات الأدمن.

## 13) الأوامر المفيدة

```bash
npm run lint         # ESLint
npm run typecheck    # فحص الأنواع
npm run test         # الاختبارات
npm run db:studio    # واجهة Prisma Studio لاستعراض البيانات
```

## أمن وممارسات مهمة

- كل عملية على المحفظة تُسجَّل في `WalletTransaction` (لا يوجد تعديل مباشر للرصيد)
- خصم الرصيد عملية ذرية على مستوى قاعدة البيانات (`UPDATE ... WHERE balance >= amount`) — آمنة عند التزامن
- السعر النهائي يُحسب دائمًا من السيرفر اعتمادًا على بيانات قاعدة البيانات، وليس مما يرسله المتصفح
- مفاتيح API الخاصة بالمزودين مشفّرة في قاعدة البيانات ولا تُرسل للعميل أبدًا
- فشل إرسال الطلب للمزوّد يُشغّل استرجاعًا تلقائيًا للمبلغ (لا يفقد العميل ماله)
- `AuditLog` يسجّل الأحداث الحساسة (تسجيل دخول، تعديلات مالية، تفعيل/تعطيل حسابات وخدمات...)
