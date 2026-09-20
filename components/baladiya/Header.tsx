"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { municipality } from "@/lib/data/municipality";
import { IconEmblem, IconMenu, IconClose } from "./icons";

const navLinks = [
  { href: "/baladiya", label: "الرئيسية" },
  { href: "/baladiya/safety", label: "السلامة المرورية" },
  { href: "/baladiya/achievements", label: "منجزات البلدية" },
  { href: "/baladiya/spending", label: "كفاءة الإنفاق" },
  { href: "/baladiya/revenues", label: "الإيرادات والاستثمارات" }
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#F8F6F0]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/baladiya" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-800/30 bg-white text-emerald-800 shadow-sm">
            <IconEmblem className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-emerald-900 sm:text-base">
              {municipality.name}
            </span>
            <span className="block text-[11px] text-emerald-800/70">{municipality.authority}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-950/80 hover:bg-emerald-800/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/15 text-emerald-900 lg:hidden"
        >
          {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-emerald-900/10 bg-[#F8F6F0] px-4 pb-4 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium ${
                      active ? "bg-emerald-800 text-white" : "text-emerald-950/80 hover:bg-emerald-800/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
