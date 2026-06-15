"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay in ms before the element animates in once visible */
  delay?: number;
  /** initial translate direction */
  from?: "bottom" | "left" | "right" | "none";
}

export function Reveal({ children, className, delay = 0, from = "bottom" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden =
    from === "bottom"
      ? "translate-y-8"
      : from === "left"
        ? "-translate-x-8"
        : from === "right"
          ? "translate-x-8"
          : "";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-none"
          : cn("scale-[0.97] opacity-0 blur-[3px]", hidden),
        className
      )}
    >
      {children}
    </div>
  );
}
