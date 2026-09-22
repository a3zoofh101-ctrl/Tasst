"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      position="top-center"
      dir="rtl"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast: "font-arabic smm-glass !shadow-xl"
        }
      }}
    />
  );
}
