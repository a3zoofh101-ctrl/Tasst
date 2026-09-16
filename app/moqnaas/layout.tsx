import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "مقناص | لعبة صيد البر السعودي",
  description:
    "لعبة مقناص — اركب سيارتك الدفع الرباعي، ادخل البر السعودي، وابحث عن القمري والحمام في أجواء شعبية واقعية."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c0a07"
};

export default function MoqnaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic overscroll-none bg-[#0c0a07]">{children}</body>
    </html>
  );
}
