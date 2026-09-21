import Link from "next/link";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/smm/cn";

const SIZES = {
  sm: { badge: "size-7 rounded-lg", icon: "size-3.5", text: "text-sm" },
  md: { badge: "size-9 rounded-xl", icon: "size-[18px]", text: "text-lg" },
  lg: { badge: "size-11 rounded-xl", icon: "size-5", text: "text-xl" }
};

export function Logo({
  size = "md",
  subtitle,
  href = "/smm",
  className
}: {
  size?: keyof typeof SIZES;
  subtitle?: string;
  href?: string | null;
  className?: string;
}) {
  const s = SIZES[size];

  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <span className={cn("flex items-center justify-center bg-brand-gradient text-white shadow-glow", s.badge)}>
        <Rocket className={s.icon} />
      </span>
      <span className={cn("font-extrabold leading-none text-fg", s.text)}>
        تَسّت{subtitle && <span className="align-middle text-sm font-medium text-muted"> {subtitle}</span>}
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
