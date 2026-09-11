import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "p-london",
    slug: "london",
    name: { ar: "لندن", en: "London" },
    tagline: {
      ar: "أناقة ضبابية بين المطر والعود",
      en: "Misty elegance between rain and oud"
    },
    description: {
      ar: "لندن عطر رجالي معاصر يستلهم شخصيته من شوارع المدينة الضبابية ليلاً؛ مزيج من الجلد الفاخر والتوابل الدافئة يلتقي بقلب خشبي عميق، ليمنحك حضورًا هادئًا وواثقًا يدوم طويلاً.",
      en: "London is a contemporary masculine fragrance inspired by the city's misty streets at night; a blend of fine leather and warm spice meets a deep woody heart, giving you a calm, confident presence that lasts."
    },
    gender: "men",
    concentration: { ar: "أو دو بارفان", en: "Eau de Parfum" },
    images: ["/products/london.webp"],
    sizes: [
      { ml: 50, price: 249, compareAtPrice: 299, sku: "LDN-50" },
      { ml: 100, price: 369, compareAtPrice: 439, sku: "LDN-100" }
    ],
    notes: {
      top: [
        { ar: "برغموت", en: "Bergamot" },
        { ar: "فلفل أسود", en: "Black Pepper" }
      ],
      heart: [
        { ar: "جلد", en: "Leather" },
        { ar: "زعفران", en: "Saffron" }
      ],
      base: [
        { ar: "عود", en: "Oud" },
        { ar: "خشب الصندل", en: "Sandalwood" },
        { ar: "كهرمان", en: "Amber" }
      ]
    },
    tags: ["bestseller", "national-day"],
    collection: "city-icons",
    rating: 4.8,
    reviewCount: 214,
    inStock: true
  },
  {
    id: "p-tokyo",
    slug: "tokyo",
    name: { ar: "طوكيو", en: "Tokyo" },
    tagline: {
      ar: "نقاء زهري ياباني بلمسة حريرية",
      en: "Japanese floral purity with a silky touch"
    },
    description: {
      ar: "طوكيو عطر نسائي رقيق يجمع بين نقاء زهرة الكرز وأناقة الياسمين الأبيض، مع قاعدة مسك حريرية ناعمة تمنحك إحساسًا بالانتعاش والرقي طوال اليوم، مستوحى من هدوء الحدائق اليابانية وضجيج المدينة الحديثة.",
      en: "Tokyo is a delicate feminine fragrance combining the purity of cherry blossom with the elegance of white jasmine, resting on a silky soft musk base that gives you a refreshed, refined feel all day — inspired by the calm of Japanese gardens amid the modern city."
    },
    gender: "women",
    concentration: { ar: "أو دو بارفان", en: "Eau de Parfum" },
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595425964272-3ee1b3d0e5b8?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: [
      { ml: 50, price: 229, compareAtPrice: 269, sku: "TKY-50" },
      { ml: 100, price: 339, compareAtPrice: 399, sku: "TKY-100" }
    ],
    notes: {
      top: [
        { ar: "زهر الكرز", en: "Cherry Blossom" },
        { ar: "ليتشي", en: "Lychee" }
      ],
      heart: [
        { ar: "ياسمين أبيض", en: "White Jasmine" },
        { ar: "فاوانيا", en: "Peony" }
      ],
      base: [
        { ar: "مسك أبيض", en: "White Musk" },
        { ar: "خشب الأرز", en: "Cedarwood" }
      ]
    },
    tags: ["new", "bestseller"],
    collection: "city-icons",
    rating: 4.9,
    reviewCount: 187,
    inStock: true
  },
  {
    id: "p-miami",
    slug: "miami",
    name: { ar: "ميامي", en: "Miami" },
    tagline: {
      ar: "انتعاش استوائي يلامس المحيط",
      en: "Tropical freshness that touches the ocean"
    },
    description: {
      ar: "ميامي عطر للجنسين مفعم بالحيوية، يفتح بنفحات حمضيات استوائية منعشة ثم ينساب نحو قلب من الياسمين المائي والنعناع، لينتهي بقاعدة خشبية مسكية تذكرك بنسيم الشاطئ عند الغروب.",
      en: "Miami is a vibrant unisex fragrance that opens with refreshing tropical citrus, flows into a watery jasmine and mint heart, and settles on a musky woody base that recalls the beach breeze at sunset."
    },
    gender: "unisex",
    concentration: { ar: "أو دو تواليت", en: "Eau de Toilette" },
    images: ["/products/miami.webp"],
    sizes: [
      { ml: 50, price: 199, compareAtPrice: 239, sku: "MIA-50" },
      { ml: 100, price: 299, compareAtPrice: 359, sku: "MIA-100" }
    ],
    notes: {
      top: [
        { ar: "جريب فروت", en: "Grapefruit" },
        { ar: "ليمون", en: "Lemon" }
      ],
      heart: [
        { ar: "ياسمين مائي", en: "Water Jasmine" },
        { ar: "نعناع", en: "Mint" }
      ],
      base: [
        { ar: "مسك", en: "Musk" },
        { ar: "خشب أبيض", en: "White Wood" }
      ]
    },
    tags: ["bestseller", "offer", "national-day"],
    collection: "city-icons",
    rating: 4.7,
    reviewCount: 163,
    inStock: true
  },
  {
    id: "p-paris",
    slug: "paris",
    name: { ar: "باريس", en: "Paris" },
    tagline: {
      ar: "رومانسية خالدة بلمسة وردية",
      en: "Timeless romance with a rose touch"
    },
    description: {
      ar: "باريس عطر نسائي كلاسيكي يفتح بالورد البلغاري الفاخر ممزوجًا بالفانيليا الدافئة، عطر يحاكي أناقة الشارع الباريسي وأنوار المساء.",
      en: "Paris is a classic feminine fragrance opening with fine Bulgarian rose blended with warm vanilla — echoing the elegance of Parisian streets and evening lights."
    },
    gender: "women",
    concentration: { ar: "أو دو بارفان", en: "Eau de Parfum" },
    images: [
      "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: [
      { ml: 50, price: 259, compareAtPrice: 309, sku: "PAR-50" },
      { ml: 100, price: 379, sku: "PAR-100" }
    ],
    notes: {
      top: [{ ar: "توت أحمر", en: "Red Berries" }, { ar: "برغموت", en: "Bergamot" }],
      heart: [{ ar: "ورد بلغاري", en: "Bulgarian Rose" }, { ar: "زنبق", en: "Lily" }],
      base: [{ ar: "فانيليا", en: "Vanilla" }, { ar: "مسك", en: "Musk" }]
    },
    tags: ["new"],
    collection: "city-icons",
    rating: 4.6,
    reviewCount: 98,
    inStock: true
  },
  {
    id: "p-riyadh",
    slug: "riyadh",
    name: { ar: "الرياض", en: "Riyadh" },
    tagline: {
      ar: "عراقة عربية بحلة عصرية",
      en: "Arabian heritage, modern edge"
    },
    description: {
      ar: "الرياض عطر رجالي فاخر يحتفي بالتراث العربي الأصيل؛ عود ثمين وزعفران دافئ يمتزجان بالعنبر الفاخر في تركيبة تعكس عراقة المكان وعصرية الحاضر.",
      en: "Riyadh is a luxurious masculine fragrance celebrating authentic Arabian heritage; precious oud and warm saffron blend with fine amber in a composition that reflects both heritage and modern presence."
    },
    gender: "men",
    concentration: { ar: "برفان", en: "Parfum" },
    images: [
      "https://images.unsplash.com/photo-1615572968247-2af0e6f6b0c9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: [
      { ml: 50, price: 289, compareAtPrice: 339, sku: "RUH-50" },
      { ml: 100, price: 419, compareAtPrice: 499, sku: "RUH-100" }
    ],
    notes: {
      top: [{ ar: "زعفران", en: "Saffron" }, { ar: "هيل", en: "Cardamom" }],
      heart: [{ ar: "عود كمبودي", en: "Cambodian Oud" }, { ar: "ورد طائفي", en: "Taif Rose" }],
      base: [{ ar: "عنبر", en: "Amber" }, { ar: "مسك أبيض", en: "White Musk" }]
    },
    tags: ["bestseller", "national-day", "limited"],
    collection: "heritage",
    rating: 4.9,
    reviewCount: 276,
    inStock: true
  },
  {
    id: "p-dubai",
    slug: "dubai",
    name: { ar: "دبي", en: "Dubai" },
    tagline: {
      ar: "بريق فاخر بين الرمال والذهب",
      en: "Opulent shimmer between sand and gold"
    },
    description: {
      ar: "دبي عطر للجنسين يجمع بين الفخامة والحداثة؛ نفحات حمضية ذهبية تنساب نحو قلب من الياسمين والعنبر، لتترك أثرًا لامعًا يليق بأفق المدينة الذهبي.",
      en: "Dubai is a unisex fragrance combining opulence and modernity; golden citrus notes flow into a jasmine and amber heart, leaving a shimmering trail worthy of the city's golden skyline."
    },
    gender: "unisex",
    concentration: { ar: "أو دو بارفان", en: "Eau de Parfum" },
    images: [
      "https://images.unsplash.com/photo-1615368144592-05c8f9e1b6c1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: [
      { ml: 50, price: 259, compareAtPrice: 299, sku: "DXB-50" },
      { ml: 100, price: 389, compareAtPrice: 459, sku: "DXB-100" }
    ],
    notes: {
      top: [{ ar: "حمضيات ذهبية", en: "Golden Citrus" }, { ar: "خوخ", en: "Peach" }],
      heart: [{ ar: "ياسمين", en: "Jasmine" }, { ar: "زهر البرتقال", en: "Orange Blossom" }],
      base: [{ ar: "عنبر", en: "Amber" }, { ar: "خشب الصندل", en: "Sandalwood" }]
    },
    tags: ["offer"],
    collection: "city-icons",
    rating: 4.5,
    reviewCount: 121,
    inStock: true
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && (p.collection === product.collection || p.gender === product.gender))
    .slice(0, limit);
}
