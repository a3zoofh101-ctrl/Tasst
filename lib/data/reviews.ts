import { Review } from "@/lib/types";

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "p-london",
    name: { ar: "عبدالله الحربي", en: "Abdullah Al-Harbi" },
    rating: 5,
    date: "2026-06-12",
    comment: {
      ar: "ثبات ممتاز وريحة فخمة جدًا، أحسست بثقة زيادة وأنا لابسه. التغليف كان راقي جدًا.",
      en: "Excellent longevity and a truly luxurious scent — it gave me real confidence. Packaging was very elegant too."
    },
    verified: true
  },
  {
    id: "r2",
    productId: "p-london",
    name: { ar: "فيصل القحطاني", en: "Faisal Al-Qahtani" },
    rating: 5,
    date: "2026-05-02",
    comment: {
      ar: "من أفضل العطور الرجالية اللي جربتها هالسنة، القوام الخشبي واضح وما يطغى.",
      en: "One of the best men's fragrances I've tried this year — the woody base is present but never overpowering."
    },
    verified: true
  },
  {
    id: "r3",
    productId: "p-tokyo",
    name: { ar: "سارة العتيبي", en: "Sarah Al-Otaibi" },
    rating: 5,
    date: "2026-07-20",
    comment: {
      ar: "خفيف وناعم بطريقة تجنن، مثالي للدوام والمناسبات النهارية.",
      en: "Light and soft in the best way — perfect for work and daytime events."
    },
    verified: true
  },
  {
    id: "r4",
    productId: "p-tokyo",
    name: { ar: "نورة الدوسري", en: "Noura Al-Dosari" },
    rating: 4,
    date: "2026-04-11",
    comment: {
      ar: "الرائحة جميلة جدًا بس تمنيت لو الثبات أطول شوي.",
      en: "Beautiful scent, though I wish the longevity was a touch longer."
    },
    verified: true
  },
  {
    id: "r5",
    productId: "p-miami",
    name: { ar: "خالد المطيري", en: "Khaled Al-Mutairi" },
    rating: 5,
    date: "2026-08-01",
    comment: {
      ar: "منعش جدًا ومناسب للصيف، صار العطر المفضل عندي في الرحلات.",
      en: "Super refreshing and perfect for summer — became my go-to travel fragrance."
    },
    verified: true
  },
  {
    id: "r6",
    productId: "p-riyadh",
    name: { ar: "منيرة الشمري", en: "Muneera Al-Shammari" },
    rating: 5,
    date: "2026-09-02",
    comment: {
      ar: "عود فخم وأصيل، إهداء رائع لأبوي بمناسبة اليوم الوطني.",
      en: "Rich, authentic oud — a wonderful National Day gift for my father."
    },
    verified: true
  }
];

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}
