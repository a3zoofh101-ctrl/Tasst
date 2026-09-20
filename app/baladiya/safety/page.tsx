import type { Metadata } from "next";
import { municipality } from "@/lib/data/municipality";
import SectionDetail from "@/components/baladiya/SectionDetail";

const section = municipality.sections.find((s) => s.id === "safety")!;

export const metadata: Metadata = { title: section.shortTitle };

export default function SafetyPage() {
  return <SectionDetail section={section} />;
}
