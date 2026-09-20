import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { municipality } from "@/lib/data/municipality";
import Header from "@/components/baladiya/Header";
import Footer from "@/components/baladiya/Footer";

export const metadata: Metadata = {
  title: {
    default: `${municipality.reportLabel} ${municipality.reportYear}م`,
    template: `%s | ${municipality.name}`
  },
  description: municipality.intro
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#064e3b"
};

export default function BaladiyaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic bg-[#F8F6F0] text-emerald-950">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
