import type { Metadata } from "next";
import { municipality } from "@/lib/data/municipality";
import { projectShowcase } from "@/lib/data/projectShowcase";
import { achievementsGallery } from "@/lib/data/achievementsGallery";
import SectionDetail from "@/components/baladiya/SectionDetail";
import ProjectShowcase from "@/components/baladiya/ProjectShowcase";
import AchievementsGallery from "@/components/baladiya/AchievementsGallery";

const section = municipality.sections.find((s) => s.id === "achievements")!;

export const metadata: Metadata = { title: section.shortTitle };

export default function AchievementsPage() {
  return (
    <SectionDetail section={section}>
      {projectShowcase.map((item) => (
        <ProjectShowcase key={item.id} item={item} />
      ))}
      <AchievementsGallery photos={achievementsGallery} />
    </SectionDetail>
  );
}
