import type { Metadata } from "next";
import { municipality } from "@/lib/data/municipality";
import SectionDetail from "@/components/baladiya/SectionDetail";

const section = municipality.sections.find((s) => s.id === "achievements")!;

export const metadata: Metadata = { title: section.shortTitle };

export default function AchievementsPage() {
  return <SectionDetail section={section} />;
}
