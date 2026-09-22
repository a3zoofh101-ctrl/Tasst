import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import "@/app/(smm)/theme.css";
import { ThemeProvider } from "@/components/smm/layout/ThemeProvider";
import { Toaster } from "@/components/smm/layout/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "بوست | BOOST - خدمات التواصل الاجتماعي",
    template: "%s | بوست"
  },
  description: "بوست BOOST - منصة لخدمات التواصل الاجتماعي",
  openGraph: {
    title: "بوست | BOOST - خدمات التواصل الاجتماعي",
    description: "بوست BOOST - منصة لخدمات التواصل الاجتماعي",
    locale: "ar",
    images: [{ url: "/images/branding/og-image.png", width: 1200, height: 630, alt: "بوست BOOST" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "بوست | BOOST - خدمات التواصل الاجتماعي",
    description: "بوست BOOST - منصة لخدمات التواصل الاجتماعي",
    images: ["/images/branding/og-image.png"]
  }
};

export default function SmmRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="smm-root font-arabic antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
