import { CarSpec, RegionSpec } from "./types";

export const CARS: CarSpec[] = [
  {
    id: "landcruiser",
    name: "شاص",
    subtitle: "Toyota Land Cruiser",
    description:
      "دفع رباعي كامل، صندوق خلفي وشكل المقناص المعروف. ثبات عالي على الرمل وصوت محرك عميق.",
    color: "#e9e4d8",
    colorDark: "#8a8371",
    accent: "#b3763b",
    topSpeed: 118,
    acceleration: 1.05,
    handling: 0.95,
    suspensionSoftness: 0.7,
    enginePitch: 62,
    engineGrit: 0.35
  },
  {
    id: "gmc",
    name: "جمس بهباني",
    subtitle: "GMC Suburban كلاسيك",
    description:
      "طابع رحلات البر القديمة، تعليق وحركة أثقل، وصوت محرك أخشن وأثقل من الشاص.",
    color: "#c8b48a",
    colorDark: "#6b5a3c",
    accent: "#7a3b2e",
    topSpeed: 104,
    acceleration: 0.85,
    handling: 0.8,
    suspensionSoftness: 1.0,
    enginePitch: 48,
    engineGrit: 0.55
  },
  {
    id: "datsun",
    name: "ددسن",
    subtitle: "موديل قديم سعودي",
    description:
      "خفيفة وسريعة، مناسبة جداً للمقناص السريع بين الكثبان بصوت محرك أعلى نبرة.",
    color: "#d7d2c4",
    colorDark: "#9a8f6f",
    accent: "#25543a",
    topSpeed: 130,
    acceleration: 1.25,
    handling: 1.15,
    suspensionSoftness: 0.45,
    enginePitch: 78,
    engineGrit: 0.2
  }
];

export const REGIONS: RegionSpec[] = [
  {
    id: "open-desert",
    name: "البر المفتوح",
    description: "كثبان رملية ممتدة، شعيب وأثر كفرات قديمة، ومخيم صغير بعيد.",
    available: true,
    duneColor: "#c9a15f",
    skyDay: ["#bfe1f2", "#f3d9a0"],
    skySunset: ["#2a3560", "#e58a4f"],
    sandColor: "#d8b578",
    sandColorDark: "#a9803f"
  },
  {
    id: "nofud",
    name: "النفود",
    description: "كثبان عالية وناعمة، قريباً في تحديث قادم.",
    available: false,
    duneColor: "#d9b673",
    skyDay: ["#bfe1f2", "#f3d9a0"],
    skySunset: ["#2a3560", "#e58a4f"],
    sandColor: "#e0be82",
    sandColorDark: "#b28c4c"
  },
  {
    id: "rawdah",
    name: "الروضة",
    description: "سهول خضراء بعد المطر، قريباً في تحديث قادم.",
    available: false,
    duneColor: "#a7b06a",
    skyDay: ["#bfe1f2", "#f3d9a0"],
    skySunset: ["#2a3560", "#e58a4f"],
    sandColor: "#c3b06a",
    sandColorDark: "#8f7f3f"
  },
  {
    id: "shuayb",
    name: "الشعيب",
    description: "مجاري السيول وصخور متناثرة، قريباً في تحديث قادم.",
    available: false,
    duneColor: "#b79a76",
    skyDay: ["#bfe1f2", "#f3d9a0"],
    skySunset: ["#2a3560", "#e58a4f"],
    sandColor: "#b99e6f",
    sandColorDark: "#8a7248"
  }
];

export function getCar(id: string | null | undefined) {
  return CARS.find((c) => c.id === id) ?? CARS[0];
}

export function getRegion(id: string | null | undefined) {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
