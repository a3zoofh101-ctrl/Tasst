import { FaqItem } from "@/lib/types";

export const faqs: FaqItem[] = [
  {
    id: "f1",
    question: { ar: "كم مدة توصيل الطلب؟", en: "How long does delivery take?" },
    answer: {
      ar: "يتم توصيل الطلبات داخل المملكة خلال 1-3 أيام عمل، ويصلك رمز تتبع فور شحن طلبك.",
      en: "Orders within the Kingdom are delivered within 1-3 business days, and you'll receive a tracking code once your order ships."
    }
  },
  {
    id: "f2",
    question: { ar: "هل يمكنني إرجاع أو استبدال المنتج؟", en: "Can I return or exchange a product?" },
    answer: {
      ar: "نعم، يمكنك إرجاع أو استبدال أي منتج خلال 14 يومًا من الاستلام بشرط أن يكون بحالته الأصلية.",
      en: "Yes, you can return or exchange any product within 14 days of delivery, provided it's in its original condition."
    }
  },
  {
    id: "f3",
    question: { ar: "هل العطور أصلية 100%؟", en: "Are the fragrances 100% authentic?" },
    answer: {
      ar: "جميع منتجات لادورتي مصنّعة ومعبأة بجودة عالية تحت إشراف مباشر من العلامة، مع ضمان الجودة على كل عبوة.",
      en: "All L'ADOUR products are manufactured and bottled to a high standard under direct brand supervision, with a quality guarantee on every bottle."
    }
  },
  {
    id: "f4",
    question: { ar: "ما طرق الدفع المتاحة؟", en: "What payment methods are available?" },
    answer: {
      ar: "نوفر الدفع عبر مدى، فيزا، ماستركارد، Apple Pay، والدفع عند الاستلام في المدن المدعومة.",
      en: "We support Mada, Visa, Mastercard, Apple Pay, and cash on delivery in supported cities."
    }
  },
  {
    id: "f5",
    question: { ar: "كيف أستخدم كود الخصم؟", en: "How do I use a discount code?" },
    answer: {
      ar: "أضف المنتجات إلى السلة، ثم أدخل الكود في خانة \"كود الخصم\" أثناء إتمام الطلب وسيُطبق الخصم تلقائيًا.",
      en: "Add products to your cart, then enter the code in the \"Discount Code\" field at checkout — the discount applies automatically."
    }
  }
];
