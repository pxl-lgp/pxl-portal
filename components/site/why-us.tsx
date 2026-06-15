"use client";

import { useState } from "react";
import {
  Award,
  BarChart3,
  Info,
  MessagesSquare,
  Puzzle,
  RefreshCw,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { whyChooseUs } from "@/lib/content";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  target: Target,
  award: Award,
  chart: BarChart3,
  messages: MessagesSquare,
  puzzle: Puzzle,
  refresh: RefreshCw,
  trending: TrendingUp,
};

/** 3D flip cards — hover (or tap on mobile) to reveal the client benefit. */
export function WhyUs() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <section id="why-us" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Why Choose Us"
          title={whyChooseUs.heading}
          description={whyChooseUs.intro}
        />
        <p className="mb-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Info className="size-4" />
          Hover or tap a card to flip it and see what&apos;s in it for you
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {whyChooseUs.reasons.map((reason, i) => {
            const Icon = icons[reason.icon];
            const isFlipped = flipped === i;
            return (
              <Reveal key={reason.title} delay={(i % 4) * 80}>
                <button
                  type="button"
                  className="group h-72 w-full [perspective:1200px]"
                  onClick={() => setFlipped(isFlipped ? null : i)}
                  aria-label={`${reason.title} — flip card for details`}
                >
                  <div
                    className={cn(
                      "relative size-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]",
                      isFlipped && "[transform:rotateY(180deg)]"
                    )}
                  >
                    {/* front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm [backface-visibility:hidden]">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-7" />
                      </span>
                      <h3 className="text-lg font-bold">{reason.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {reason.front}
                      </p>
                      <span className="text-xs font-medium text-primary">
                        Flip me ↻
                      </span>
                    </div>
                    {/* back — white card pops against the dark canvas */}
                    <div className="absolute inset-0 flex flex-col justify-center gap-3 rounded-2xl border border-white bg-white p-6 text-left text-[#303030] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <p className="text-sm leading-relaxed">
                        {reason.description}
                      </p>
                      <p className="text-sm font-semibold leading-relaxed text-[#0087b3]">
                        {reason.benefit}
                      </p>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
