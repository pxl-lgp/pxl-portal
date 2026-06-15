"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Gift,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { process } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Interactive 7-step journey — click steps or use prev/next to walk through. */
export function Process() {
  const [step, setStep] = useState(0);
  const total = process.steps.length;
  const current = process.steps[step];

  return (
    <section id="process" className="scroll-mt-20 bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          badge="Our Process"
          title={process.heading}
          description={process.intro}
        />

        <Reveal>
          {/* step selector */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {process.steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setStep(i)}
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 hover:scale-110",
                  i === step
                    ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : i < step
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                )}
                aria-label={`Step ${i + 1}: ${s.title}`}
              >
                {i === step && (
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40 [animation-duration:1.8s]"
                  />
                )}
                {i < step ? <CheckCircle2 className="size-5" /> : i + 1}
              </button>
            ))}
          </div>

          <Progress value={((step + 1) / total) * 100} className="mb-8 h-2" />

          <Card key={step} className="animate-pop">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  Step {step + 1} of {total}
                </span>
              </div>
              <h3 className="mb-6 text-2xl font-extrabold sm:text-3xl">
                {current.title}
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    <Wrench className="size-4" />
                    What happens
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {current.what}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    <CircleHelp className="size-4" />
                    Why it matters
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {current.why}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                    <Gift className="size-4" />
                    Your benefit
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {current.benefit}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="size-4" /> Previous
                </Button>
                {step < total - 1 ? (
                  <Button
                    className="rounded-full"
                    onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                  >
                    Next Step <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button asChild className="rounded-full">
                    <a href="#contact">Start at Step 1 — Free</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
