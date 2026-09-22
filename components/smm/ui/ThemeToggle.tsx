"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";

const emptySubscribe = () => () => {};

// Avoids a hydration mismatch (server never knows the resolved theme)
// without an effect: subscribes to nothing, and only the client snapshot
// reports true.
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="size-9" />;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="!px-0 size-9"
      aria-label="تبديل المظهر"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
