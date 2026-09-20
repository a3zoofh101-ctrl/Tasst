import { SVGProps } from "react";
import { IconShield, IconBuildings, IconCoins, IconChartLine } from "./icons";
import { MunicipalitySection } from "@/lib/data/municipality";

export function SectionIcon({
  id,
  ...props
}: { id: MunicipalitySection["id"] } & SVGProps<SVGSVGElement>) {
  switch (id) {
    case "safety":
      return <IconShield {...props} />;
    case "achievements":
      return <IconBuildings {...props} />;
    case "spending":
      return <IconCoins {...props} />;
    case "revenues":
      return <IconChartLine {...props} />;
    default:
      return null;
  }
}
