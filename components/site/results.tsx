"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/site/count-up";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { TiltCard } from "@/components/site/tilt-card";
import { results } from "@/lib/content";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function Results() {
  // Growth calculator state
  const [budget, setBudget] = useState(50_000); // monthly ad budget
  const [costPerLead, setCostPerLead] = useState(250);
  const [closeRate, setCloseRate] = useState(20); // %
  const [avgSale, setAvgSale] = useState(5_000);

  const leads = Math.round(budget / costPerLead);
  const customers = Math.round((leads * closeRate) / 100);
  const revenue = customers * avgSale;
  const roas = budget > 0 ? revenue / budget : 0;

  return (
    <section id="results" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Results & Impact"
          title={results.heading}
          description={results.intro}
        />

        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className="leading-relaxed text-muted-foreground">
            {results.howWeMeasure}
          </p>
        </Reveal>

        {/* Example outcome stats */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.exampleStats.map((stat, i) => (
            <Reveal key={stat.label} delay={(i % 3) * 100}>
              <TiltCard className="h-full">
                <Card className="h-full text-center transition-colors duration-300 hover:border-primary/40">
                  <CardContent className="p-6">
                    <div className="text-4xl font-extrabold text-primary sm:text-5xl">
                      <CountUp
                        end={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals ?? 0}
                      />
                    </div>
                    <div className="mt-2 font-semibold">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.sublabel}
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mb-16 max-w-2xl text-center text-sm text-muted-foreground">
          {results.disclaimer}
        </Reveal>

        {/* What we measure */}
        <div className="mb-16 grid gap-4 md:grid-cols-5">
          {results.metricsExplained.map((metric, i) => (
            <Reveal key={metric.title} delay={i * 80}>
              <div className="h-full rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40">
                <TrendingUp className="mb-2 size-5 text-primary" />
                <h4 className="mb-1 text-sm font-bold">{metric.title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Interactive growth calculator */}
        <Reveal>
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-[#36daff]/10">
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Calculator className="size-6" />
                </span>
                <h3 className="text-2xl font-extrabold sm:text-3xl">
                  {results.calculator.heading}
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  {results.calculator.subheading}
                </p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                <div className="space-y-8">
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Monthly ad budget</span>
                      <span className="text-primary">{peso.format(budget)}</span>
                    </div>
                    <Slider
                      value={[budget]}
                      min={10_000}
                      max={500_000}
                      step={5_000}
                      onValueChange={([v]) => setBudget(v)}
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Cost per lead</span>
                      <span className="text-primary">
                        {peso.format(costPerLead)}
                      </span>
                    </div>
                    <Slider
                      value={[costPerLead]}
                      min={50}
                      max={1_000}
                      step={10}
                      onValueChange={([v]) => setCostPerLead(v)}
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Lead-to-customer rate</span>
                      <span className="text-primary">{closeRate}%</span>
                    </div>
                    <Slider
                      value={[closeRate]}
                      min={5}
                      max={60}
                      step={1}
                      onValueChange={([v]) => setCloseRate(v)}
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Average sale value</span>
                      <span className="text-primary">{peso.format(avgSale)}</span>
                    </div>
                    <Slider
                      value={[avgSale]}
                      min={500}
                      max={100_000}
                      step={500}
                      onValueChange={([v]) => setAvgSale(v)}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border bg-card p-5 text-center">
                      <div className="text-3xl font-extrabold text-primary">
                        {leads.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        leads / month
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-5 text-center">
                      <div className="text-3xl font-extrabold text-primary">
                        {customers.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        new customers / month
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6 text-center">
                    <div className="text-4xl font-extrabold text-primary">
                      {peso.format(revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      estimated monthly revenue
                    </div>
                    <div className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                      {roas.toFixed(1)}x return on ad spend
                    </div>
                  </div>
                  <Button asChild size="lg" className="rounded-full">
                    <a href="#contact">
                      {roas >= 3
                        ? "Nice numbers! Let's make them real →"
                        : "Let's improve these numbers together →"}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
