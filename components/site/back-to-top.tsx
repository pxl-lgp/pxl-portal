"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rocket button that appears after scrolling and "launches" you back to the top. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const launch = () => {
    setLaunching(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setLaunching(false), 900);
  };

  return (
    <button
      onClick={launch}
      aria-label="Back to top"
      className={cn(
        "fixed right-5 bottom-5 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
      )}
    >
      <Rocket
        className={cn(
          "size-5 -rotate-45 transition-transform duration-700",
          launching && "-translate-y-24 scale-75 opacity-0"
        )}
      />
    </button>
  );
}
