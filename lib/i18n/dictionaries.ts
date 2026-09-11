import { Locale } from "@/lib/types";

export const locales: Locale[] = ["ar", "en"];
export const defaultLocale: Locale = "ar";

export const dictionaries = {
  ar: {
    dir: "rtl",
    brand: { name: "لادورتي", sub: "L'ADOUR" },
    topbar: {
      messages: [
        "شحن مجاني للطلبات فوق 250 ريال",
        "عروض اليوم الوطني 🇸🇦 خصم يصل إلى 30%",
        "إرجاع واستبدال مجاني خلال 14 يومًا"
      ],
      lang: "English"
    },
    nav: {
      products: "المنتجات",
      offers: "العروض",
      collections: "المجموعات",
      about: "من نحن",
      faq: "الأسئلة الشائعة",
      search: "بحث",
      cart: "السلة",
      account: "الحساب"
    },
    searchBar: {
      placeholder: "ابحث عن عطر، مجموعة، أو نوع...",
      recent: "عمليات بحث شائعة",
      noResults: "لا توجد نتائج مطابقة",
      cta: "بحث"
    },
    home: {
      heroEyebrow: "لادورتي L'ADOUR",
      heroTitle: "عطور تروي حكاية مدينة",
      heroSubtitle: "اكتشف مجموعة لادورتي المستوحاة من أشهر مدن العالم",
      heroCta: "تسوق الآن",
      heroSecondaryCta: "استكشف المجموعات",
      bestSellers: "الأكثر مبيعًا",
      newArrivals: "عطور جديدة",
      viewAll: "عرض الكل",
      nationalDayTitle: "عروض اليوم الوطني",
      nationalDayCta: "تسوّق العروض",
      collectionsTitle: "المجموعات والعروض الخاصة",
      productsShowcase: "مختارات لادورتي",
      brandTitle: "عن لادورتي",
      brandBody:
        "لادورتي علامة سعودية متخصصة في صناعة العطور الفاخرة، نستلهم إبداعاتنا من أرقى مدن العالم لنقدم لك تجربة عطرية استثنائية تعكس شخصيتك أينما كنت. نؤمن أن العطر ليس رائحة فحسب، بل هوية تُروى في كل حضور.",
      brandCta: "تعرف علينا أكثر",
      testimonialsTitle: "ماذا يقول عملاؤنا",
      faqTitle: "الأسئلة الشائعة",
      faqCta: "جميع الأسئلة",
      socialTitle: "تابعونا",
      socialSubtitle: "كن أول من يعرف عن إصداراتنا الجديدة وعروضنا الحصرية"
    },
    badges: {
      bestseller: "الأكثر مبيعًا",
      new: "جديد",
      offer: "عرض",
      "national-day": "اليوم الوطني",
      limited: "كمية محدودة",
      outOfStock: "غير متوفر"
    },
    product: {
      rating: "التقييم",
      reviews: "تقييم",
      size: "الحجم",
      quantity: "الكمية",
      addToCart: "أضف للسلة",
      buyNow: "اشترِ الآن",
      description: "الوصف",
      notes: "النوتات العطرية",
      topNotes: "المقدمة",
      heartNotes: "القلب",
      baseNotes: "القاعدة",
      related: "قد يعجبك أيضًا",
      reviewsTitle: "آراء العملاء",
      writeReview: "أضف تقييمك",
      concentration: "التركيز",
      addedToCart: "تمت الإضافة إلى السلة",
      save: "توفير",
      sar: "ر.س"
    },
    filters: {
      title: "التصنيفات",
      sortBy: "الترتيب",
      sortFeatured: "المميزة",
      sortPriceLow: "السعر: من الأقل للأعلى",
      sortPriceHigh: "السعر: من الأعلى للأقل",
      sortNewest: "الأحدث",
      resultsCount: "منتج",
      noResults: "لا توجد منتجات مطابقة لهذا التصنيف حاليًا"
    },
    cart: {
      title: "سلة التسوق",
      empty: "سلتك فارغة حاليًا",
      emptyCta: "تصفح العطور",
      size: "الحجم",
      quantity: "الكمية",
      remove: "إزالة",
      subtotal: "المجموع الفرعي",
      discount: "الخصم",
      shipping: "الشحن",
      shippingFree: "مجاني",
      total: "الإجمالي",
      checkout: "إتمام الطلب",
      continueShopping: "متابعة التسوق",
      promoPlaceholder: "كود الخصم",
      promoApply: "تطبيق",
      promoApplied: "تم تطبيق الكود بنجاح"
    },
    checkout: {
      title: "إتمام الطلب",
      contact: "بيانات التواصل",
      fullName: "الاسم الكامل",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني",
      shippingAddress: "عنوان الشحن",
      city: "المدينة",
      district: "الحي",
      address: "تفاصيل العنوان",
      payment: "طريقة الدفع",
      paymentCard: "بطاقة مدى / فيزا / ماستركارد",
      paymentCod: "الدفع عند الاستلام",
      paymentApple: "Apple Pay",
      orderSummary: "ملخص الطلب",
      placeOrder: "تأكيد الطلب",
      required: "هذا الحقل مطلوب",
      confirmTitle: "تم استلام طلبك بنجاح!",
      confirmBody: "شكرًا لتسوقك من لادورتي، سيصلك تأكيد الطلب عبر رسالة نصية قريبًا.",
      orderNumber: "رقم الطلب",
      backHome: "العودة للرئيسية"
    },
    about: {
      title: "من نحن",
      heroTitle: "قصة لادورتي",
      heroBody:
        "وُلدت لادورتي من شغف حقيقي بفن صناعة العطور، برؤية سعودية تسعى لتقديم عطور فاخرة تحمل هوية مدن العالم، بمكونات مختارة بعناية وتركيبات تدوم طويلًا.",
      valuesTitle: "قيمنا",
      values: [
        { title: "جودة استثنائية", body: "نختار أفضل الخامات العطرية من أعرق موردي العالم." },
        { title: "هوية أصيلة", body: "كل عطر يحمل قصة مدينة ملهمة وشخصية مستقلة." },
        { title: "تجربة عميل مميزة", body: "من التصفح إلى الاستلام، نهتم بكل تفصيلة." }
      ]
    },
    faqPage: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تحتاج معرفته عن التسوق من لادورتي"
    },
    offersPage: {
      title: "عروض اليوم الوطني",
      code: "كود الخصم",
      endsIn: "ينتهي العرض خلال",
      days: "يوم",
      hours: "ساعة",
      minutes: "دقيقة",
      seconds: "ثانية",
      shopOffer: "تسوق العرض الآن"
    },
    footer: {
      about: "عن لادورتي",
      aboutBody: "علامة سعودية فاخرة لصناعة العطور، عطور تحمل هوية المدن الكبرى.",
      quickLinks: "روابط سريعة",
      help: "المساعدة",
      contact: "تواصل معنا",
      newsletter: "اشترك في نشرتنا البريدية",
      newsletterBody: "كن أول من يعلم بالعروض والإصدارات الجديدة",
      emailPlaceholder: "بريدك الإلكتروني",
      subscribe: "اشترك",
      rights: "جميع الحقوق محفوظة",
      paymentMethods: "طرق الدفع"
    },
    common: {
      sar: "ر.س",
      loading: "جارِ التحميل...",
      viewProduct: "عرض المنتج"
    }
  },
  en: {
    dir: "ltr",
    brand: { name: "L'ADOUR", sub: "لادورتي" },
    topbar: {
      messages: [
        "Free shipping on orders over 250 SAR",
        "National Day Offers 🇸🇦 up to 30% off",
        "Free returns & exchanges within 14 days"
      ],
      lang: "العربية"
    },
    nav: {
      products: "Products",
      offers: "Offers",
      collections: "Collections",
      about: "About",
      faq: "FAQ",
      search: "Search",
      cart: "Cart",
      account: "Account"
    },
    searchBar: {
      placeholder: "Search a fragrance, collection, or type...",
      recent: "Popular searches",
      noResults: "No matching results",
      cta: "Search"
    },
    home: {
      heroEyebrow: "L'ADOUR",
      heroTitle: "Fragrances That Tell a City's Story",
      heroSubtitle: "Discover the L'ADOUR collection, inspired by the world's most iconic cities",
      heroCta: "Shop Now",
      heroSecondaryCta: "Explore Collections",
      bestSellers: "Bestsellers",
      newArrivals: "New Arrivals",
      viewAll: "View All",
      nationalDayTitle: "National Day Offers",
      nationalDayCta: "Shop the Offer",
      collectionsTitle: "Collections & Special Offers",
      productsShowcase: "L'ADOUR Selections",
      brandTitle: "About L'ADOUR",
      brandBody:
        "L'ADOUR is a Saudi house of fine perfumery. We draw inspiration from the world's most refined cities to craft an exceptional olfactory experience that reflects your identity wherever you are. To us, a fragrance isn't just a scent — it's an identity told with every presence.",
      brandCta: "Learn More About Us",
      testimonialsTitle: "What Our Customers Say",
      faqTitle: "Frequently Asked Questions",
      faqCta: "All Questions",
      socialTitle: "Follow Us",
      socialSubtitle: "Be the first to know about new launches and exclusive offers"
    },
    badges: {
      bestseller: "Bestseller",
      new: "New",
      offer: "Offer",
      "national-day": "National Day",
      limited: "Limited Edition",
      outOfStock: "Out of Stock"
    },
    product: {
      rating: "Rating",
      reviews: "reviews",
      size: "Size",
      quantity: "Quantity",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      description: "Description",
      notes: "Fragrance Notes",
      topNotes: "Top Notes",
      heartNotes: "Heart Notes",
      baseNotes: "Base Notes",
      related: "You May Also Like",
      reviewsTitle: "Customer Reviews",
      writeReview: "Write a Review",
      concentration: "Concentration",
      addedToCart: "Added to your cart",
      save: "Save",
      sar: "SAR"
    },
    filters: {
      title: "Categories",
      sortBy: "Sort by",
      sortFeatured: "Featured",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortNewest: "Newest",
      resultsCount: "products",
      noResults: "No products match this category right now"
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is currently empty",
      emptyCta: "Browse Fragrances",
      size: "Size",
      quantity: "Quantity",
      remove: "Remove",
      subtotal: "Subtotal",
      discount: "Discount",
      shipping: "Shipping",
      shippingFree: "Free",
      total: "Total",
      checkout: "Checkout",
      continueShopping: "Continue Shopping",
      promoPlaceholder: "Discount code",
      promoApply: "Apply",
      promoApplied: "Code applied successfully"
    },
    checkout: {
      title: "Checkout",
      contact: "Contact Details",
      fullName: "Full Name",
      phone: "Mobile Number",
      email: "Email",
      shippingAddress: "Shipping Address",
      city: "City",
      district: "District",
      address: "Address Details",
      payment: "Payment Method",
      paymentCard: "Mada / Visa / Mastercard",
      paymentCod: "Cash on Delivery",
      paymentApple: "Apple Pay",
      orderSummary: "Order Summary",
      placeOrder: "Place Order",
      required: "This field is required",
      confirmTitle: "Your order has been placed!",
      confirmBody: "Thank you for shopping with L'ADOUR. You'll receive an order confirmation by SMS shortly.",
      orderNumber: "Order Number",
      backHome: "Back to Home"
    },
    about: {
      title: "About Us",
      heroTitle: "The L'ADOUR Story",
      heroBody:
        "L'ADOUR was born from a genuine passion for the art of perfumery — a Saudi vision crafting luxurious fragrances that carry the identity of the world's cities, with carefully selected ingredients and long-lasting compositions.",
      valuesTitle: "Our Values",
      values: [
        { title: "Exceptional Quality", body: "We source the finest raw materials from the world's most trusted suppliers." },
        { title: "Authentic Identity", body: "Every fragrance carries the story of an inspiring city and its own character." },
        { title: "Outstanding Experience", body: "From browsing to delivery, we care about every detail." }
      ]
    },
    faqPage: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about shopping with L'ADOUR"
    },
    offersPage: {
      title: "National Day Offers",
      code: "Discount Code",
      endsIn: "Offer ends in",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      shopOffer: "Shop the Offer"
    },
    footer: {
      about: "About L'ADOUR",
      aboutBody: "A Saudi house of fine perfumery — fragrances that carry the identity of great cities.",
      quickLinks: "Quick Links",
      help: "Help",
      contact: "Contact Us",
      newsletter: "Join Our Newsletter",
      newsletterBody: "Be the first to know about offers and new releases",
      emailPlaceholder: "Your email",
      subscribe: "Subscribe",
      rights: "All rights reserved",
      paymentMethods: "Payment Methods"
    },
    common: {
      sar: "SAR",
      loading: "Loading...",
      viewProduct: "View Product"
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
