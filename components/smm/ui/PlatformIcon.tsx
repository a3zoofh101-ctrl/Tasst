import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaSnapchat,
  FaTelegram,
  FaLinkedinIn,
  FaSpotify,
  FaDiscord,
  FaTwitch,
  FaPinterest,
  FaThreads,
  FaWhatsapp,
  FaReddit,
  FaSoundcloud,
  FaYoutube,
  FaGoogle
} from "react-icons/fa6";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/smm/cn";

// Each platform's real brand mark + signature color, so the services grid
// reads at a glance the way every SMM panel's does — a plain colored
// letter avatar doesn't communicate "Instagram" the way the camera icon
// on its gradient does.
const PLATFORM_STYLES: Record<string, { icon: IconType; className: string }> = {
  facebook: { icon: FaFacebookF, className: "bg-[#1877F2] text-white" },
  instagram: { icon: FaInstagram, className: "bg-gradient-to-br from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white" },
  tiktok: { icon: FaTiktok, className: "bg-black text-white" },
  "x-twitter": { icon: FaXTwitter, className: "bg-black text-white" },
  youtube: { icon: FaYoutube, className: "bg-[#FF0000] text-white" },
  snapchat: { icon: FaSnapchat, className: "bg-[#FFFC00] text-black" },
  telegram: { icon: FaTelegram, className: "bg-[#26A5E4] text-white" },
  linkedin: { icon: FaLinkedinIn, className: "bg-[#0A66C2] text-white" },
  spotify: { icon: FaSpotify, className: "bg-[#1DB954] text-white" },
  discord: { icon: FaDiscord, className: "bg-[#5865F2] text-white" },
  twitch: { icon: FaTwitch, className: "bg-[#9146FF] text-white" },
  pinterest: { icon: FaPinterest, className: "bg-[#E60023] text-white" },
  threads: { icon: FaThreads, className: "bg-black text-white" },
  whatsapp: { icon: FaWhatsapp, className: "bg-[#25D366] text-white" },
  reddit: { icon: FaReddit, className: "bg-[#FF4500] text-white" },
  soundcloud: { icon: FaSoundcloud, className: "bg-[#FF5500] text-white" },
  google: { icon: FaGoogle, className: "bg-white text-[#4285F4] ring-1 ring-inset ring-border2" }
};

const SIZES = {
  sm: { badge: "size-8 rounded-lg", icon: "size-3.5" },
  md: { badge: "size-11 rounded-xl", icon: "size-5" },
  lg: { badge: "size-14 rounded-2xl", icon: "size-6" }
};

export function PlatformIcon({
  slug,
  size = "md",
  className
}: {
  slug: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const style = PLATFORM_STYLES[slug];
  const Icon = style?.icon ?? LayoutGrid;
  const s = SIZES[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        s.badge,
        style?.className ?? "bg-brand-gradient text-white",
        className
      )}
    >
      <Icon className={s.icon} />
    </span>
  );
}
