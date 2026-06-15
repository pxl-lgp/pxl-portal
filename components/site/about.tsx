"use client";

import {
  Brain,
  Handshake,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  Telescope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { TiltCard } from "@/components/site/tilt-card";
import { about } from "@/lib/content";

const icons: Record<string, LucideIcon> = {
  target: Target,
  search: Search,
  handshake: Handshake,
  brain: Brain,
  trending: TrendingUp,
  sparkles: Sparkles,
};

export function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Who We Are"
          title={about.heading}
          description={about.overview}
        />

        <Reveal>
          <Tabs defaultValue="mission" className="mx-auto max-w-3xl">
            <TabsList className="mx-auto grid w-full grid-cols-3 rounded-full">
              <TabsTrigger value="mission" className="rounded-full">
                <Target className="size-4" />
                Mission
              </TabsTrigger>
              <TabsTrigger value="vision" className="rounded-full">
                <Telescope className="size-4" />
                Vision
              </TabsTrigger>
              <TabsTrigger value="philosophy" className="rounded-full">
                <Lightbulb className="size-4" />
                Philosophy
              </TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="animate-pop">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 text-center text-lg leading-relaxed">
                  {about.mission}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="vision" className="animate-pop">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 text-center text-lg leading-relaxed">
                  {about.vision}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="philosophy" className="animate-pop">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 text-center text-lg leading-relaxed">
                  {about.philosophy}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Reveal>

        {/* Core values */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {about.values.map((value, i) => {
            const Icon = icons[value.icon];
            return (
              <Reveal key={value.title} delay={i * 80}>
                <TiltCard className="group h-full">
                  <Card className="h-full transition-colors duration-300 hover:border-primary/40">
                    <CardContent className="p-6">
                      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold">{value.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Long-form introduction */}
        <Reveal className="mx-auto mt-16 max-w-3xl space-y-5">
          {about.longForm.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
