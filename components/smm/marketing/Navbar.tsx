"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { ThemeToggle } from "@/components/smm/ui/ThemeToggle";
import { Logo } from "@/components/smm/ui/Logo";

const LINKS = [
  { href: "#how-it-works", label: "كيف تعمل المنصة" },
  { href: "#services", label: "الخدمات" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#faq", label: "الأسئلة الشائعة" }
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border2 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">تسجيل الدخول</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">إنشاء حساب</Button>
          </Link>
        </div>

        <button className="flex size-9 items-center justify-center rounded-xl text-fg lg:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border2 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-fg">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">تسجيل الدخول</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full">إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
