"use client";

import { useState } from "react";
import {
  Briefcase,
  ConciergeBell,
  GraduationCap,
  HeartPulse,
  Home,
  MapPin,
  Rocket,
  ShoppingCart,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { industries } from "@/lib/content";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  cart: ShoppingCart,
  heart: HeartPulse,
  graduation: GraduationCap,
  home: Home,
  store: Store,
  bell: ConciergeBell,
  briefcase: Briefcase,
  pin: MapPin,
  rocket: Rocket,
  star: Star,
};

/** Click an industry chip to reveal how we adapt the strategy for it. */
export function Industries() {
  const [selected, setSelected] = useState(0);
  const current = industries.list[selected];
  const CurrentIcon = icons[current.icon];

  return (
    <section id="industries" className="scroll-mt-20 bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          badge="Industries Served"
          title={industries.heading}
          description={industries.intro}
        />

        <Reveal>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {industries.list.map((industry, i) => {
              const Icon = icons[industry.icon];
              return (
                <button
                  key={industry.name}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105",
                    selected === i
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {industry.name}
                </button>
              );
            })}
          </div>

          <div
            key={selected}
            className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-sm animate-pop"
          >
            <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CurrentIcon className="size-7" />
            </span>
            <h3 className="mb-3 text-2xl font-extrabold">{current.name}</h3>
            <p className="leading-relaxed text-muted-foreground">
              {current.description}
            </p>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="leading-relaxed text-muted-foreground">
            {industries.adaptation}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
