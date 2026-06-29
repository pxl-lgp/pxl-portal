"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <Button
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle color mode"}
      className={cn("rounded-full", className)}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size={showLabel ? "sm" : "icon"}
      type="button"
      variant="outline"
    >
      {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {showLabel ? <span>{mounted && isDark ? "Light" : "Dark"}</span> : null}
    </Button>
  );
}
