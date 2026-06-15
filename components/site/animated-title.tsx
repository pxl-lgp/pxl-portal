"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

/**
 * Splits a heading into words and cascades them in — rise, de-blur, settle —
 * the first time it scrolls into view.
 */
export function AnimatedTitle({ text, className, as: Tag = "h2" }: AnimatedTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);
  const words = text.split(" ");

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
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span
            aria-hidden
            style={{ transitionDelay: `${i * 70}ms` }}
            className={cn(
              "inline-block transition-all duration-500 ease-out",
              visible
                ? "translate-y-0 opacity-100 blur-none"
                : "translate-y-[110%] opacity-0 blur-sm"
            )}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
