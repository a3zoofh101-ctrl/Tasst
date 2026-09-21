import type { Metadata } from "next";
import "@/app/globals.css";
import "@/app/(smm)/theme.css";
import { ThemeProvider } from "@/components/smm/layout/ThemeProvider";
import { Toaster } from "@/components/smm/layout/Toaster";

export const metadata: Metadata = {
  title: {
    default: "تَسّت | منصة إدارة خدمات التسويق الرقمي",
    template: "%s | تَسّت"
  },
  description: "تَسّت منصة عربية لطلب وإدارة خدمات التسويق الرقمي ومنصات التواصل الاجتماعي من مكان واحد."
};

export default function SmmRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="smm-root font-arabic antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
