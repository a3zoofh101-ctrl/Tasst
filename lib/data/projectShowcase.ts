export interface ProjectShowcaseImage {
  src: string;
  caption: string;
}

export interface ProjectShowcaseItem {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
  gallery: ProjectShowcaseImage[];
}

export const projectShowcase: ProjectShowcaseItem[] = [
  {
    id: "coastal-road",
    title: "تطوير ورصف الطريق الساحلي",
    description:
      "ضمن خطة تطوير الطرق الرئيسية بالمحافظة، تم تسوية ورصف الطريق، وتركيب أعمدة الإنارة، وزراعة النخيل والمسطحات الخضراء على جانبيه.",
    before: "/baladiya/projects/coastal-road-before.jpg",
    after: "/baladiya/projects/coastal-road-after-1.jpg",
    gallery: [
      { src: "/baladiya/projects/coastal-road-after-2.jpg", caption: "الطريق بعد الرصف والتشجير" },
      { src: "/baladiya/projects/corniche-park-night.jpg", caption: "المسطحات الخضراء والإنارة الليلية" }
    ]
  }
];
