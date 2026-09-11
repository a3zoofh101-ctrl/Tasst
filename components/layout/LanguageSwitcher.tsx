"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/types";

export default function LanguageSwitcher({
  locale,
  className,
  children
}: {
  locale: Locale;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const target: Locale = locale === "ar" ? "en" : "ar";
  const rest = pathname.split("/").slice(2).join("/");
  const href = `/${target}${rest ? `/${rest}` : ""}`;

  return (
    <Link href={href} className={className} aria-label="Switch language">
      {children}
    </Link>
  );
}
