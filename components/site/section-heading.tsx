"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedTitle } from "@/components/site/animated-title";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge: string;
  title: string;
  description?: string;
}

export function SectionHeading({ badge, title, description }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto mb-12 max-w-3xl text-center">
      <Reveal>
        <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
          {badge}
        </Badge>
      </Reveal>
      <AnimatedTitle
        text={title}
        className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
      />
      {/* accent underline draws in after the words land */}
      <div
        aria-hidden
        className={cn(
          "mx-auto mt-4 h-1 w-24 origin-left rounded-full bg-gradient-to-r from-[#5ddafc] to-[#6e81ff] transition-transform duration-700 ease-out",
          inView ? "scale-x-100" : "scale-x-0"
        )}
        style={{ transitionDelay: "500ms" }}
      />
      {description && (
        <Reveal delay={200}>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
