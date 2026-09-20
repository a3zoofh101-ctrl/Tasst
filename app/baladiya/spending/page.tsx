import type { Metadata } from "next";
import { municipality } from "@/lib/data/municipality";
import SectionDetail from "@/components/baladiya/SectionDetail";

const section = municipality.sections.find((s) => s.id === "spending")!;

export const metadata: Metadata = { title: section.shortTitle };

export default function SpendingPage() {
  return <SectionDetail section={section} />;
}
