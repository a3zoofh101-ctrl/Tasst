import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/smm/cn";

const SIZES = {
  sm: { icon: "h-10 w-auto", text: "text-sm", boost: "text-[8px] tracking-[0.18em]" },
  md: { icon: "h-10 w-auto sm:h-12", text: "text-lg", boost: "text-[9px] tracking-[0.2em] sm:text-[10px]" },
  lg: { icon: "h-14 w-auto sm:h-16", text: "text-xl", boost: "text-[11px] tracking-[0.22em]" }
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
      <Image
        src="/images/branding/boost-icon.png"
        alt="بوست BOOST"
        width={512}
        height={512}
        className={cn(s.icon, "shrink-0")}
        style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.2))" }}
        priority
      />
      <span className="flex flex-col leading-none">
        <span className={cn("font-extrabold text-fg", s.text)}>
          بوست{subtitle && <span className="align-middle text-sm font-medium text-muted"> {subtitle}</span>}
        </span>
        <span className={cn("font-bold uppercase text-muted", s.boost)}>BOOST</span>
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
