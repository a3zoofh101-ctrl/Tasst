import Link from "next/link";
import { municipality } from "@/lib/data/municipality";
import { IconEmblem, IconGlobe, IconMail, IconPhone, IconMapPin, IconTwitterX, IconInstagram } from "./icons";

const sectionLinks = [
  { href: "/baladiya/safety", label: "السلامة المرورية" },
  { href: "/baladiya/achievements", label: "منجزات البلدية" },
  { href: "/baladiya/spending", label: "كفاءة الإنفاق" },
  { href: "/baladiya/revenues", label: "الإيرادات والاستثمارات" }
];

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white">
              <IconEmblem className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold">{municipality.name}</p>
              <p className="text-[11px] text-emerald-100/70">{municipality.authority}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-emerald-100/80">{municipality.intro}</p>
        </div>

        <div>
          <p className="mb-4 text-sm font-bold text-white">أقسام التقرير</p>
          <ul className="space-y-2.5">
            {sectionLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-emerald-100/80 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-bold text-white">تواصل معنا</p>
          <ul className="space-y-3 text-sm text-emerald-100/80">
            <li className="flex items-center gap-2.5">
              <IconGlobe className="h-4 w-4 shrink-0" />
              <span dir="ltr">{municipality.contact.website}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <IconMail className="h-4 w-4 shrink-0" />
              <span dir="ltr">{municipality.contact.email}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <IconPhone className="h-4 w-4 shrink-0" />
              <span dir="ltr">{municipality.contact.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <IconMapPin className="h-4 w-4 shrink-0" />
              <span>محافظة بداء، منطقة تبوك</span>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={`https://x.com/${municipality.contact.twitter}`}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
            >
              <IconTwitterX className="h-4 w-4" />
            </a>
            <a
              href={`https://instagram.com/${municipality.contact.instagram}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
            >
              <IconInstagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-emerald-100/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            {municipality.reportLabel} {municipality.reportYear}م — جميع الحقوق محفوظة لـ{" "}
            {municipality.authority}
          </p>
          <p dir="ltr">{municipality.contact.website}</p>
        </div>
      </div>
    </footer>
  );
}
