import { SVGProps } from "react";
import { IconInstagram, IconTikTok, IconX, IconSnapchat, IconWhatsApp } from "@/components/icons";

const map = {
  instagram: IconInstagram,
  tiktok: IconTikTok,
  x: IconX,
  snapchat: IconSnapchat,
  whatsapp: IconWhatsApp
};

export default function SocialIcon({
  icon,
  ...props
}: { icon: keyof typeof map } & SVGProps<SVGSVGElement>) {
  const Cmp = map[icon];
  return <Cmp {...props} />;
}
