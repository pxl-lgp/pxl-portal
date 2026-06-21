"use client";

import {
  Globe,
  Megaphone,
  Palette,
  PenTool,
  Share2,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { services, servicesIntro } from "@/lib/content";

const icons: Record<string, LucideIcon> = {
  share: Share2,
  megaphone: Megaphone,
  pen: PenTool,
  globe: Globe,
  palette: Palette,
};

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-muted/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="What We Do"
          title={servicesIntro.heading}
          description={servicesIntro.intro}
        />

        <Reveal className="mx-auto mb-12 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="leading-relaxed text-muted-foreground">
            {servicesIntro.synergy}
          </p>
        </Reveal>

        <Reveal>
          <Tabs defaultValue={services[0].id}>
            <TabsList className="mx-auto mb-8 grid !h-auto min-h-14 w-full max-w-5xl grid-cols-2 gap-1 rounded-2xl p-2 md:grid-cols-3 lg:grid-cols-5">
              {services.map((service) => {
                const Icon = icons[service.icon];
                return (
                  <TabsTrigger
                    key={service.id}
                    value={service.id}
                    className="min-h-10 w-full min-w-0 gap-2 whitespace-normal rounded-xl px-3 py-2.5 text-center leading-tight data-[state=active]:shadow-md"
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{service.name}</span>
                    <span className="sm:hidden">{service.name.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {services.map((service) => {
              const Icon = icons[service.icon];
              return (
                <TabsContent
                  key={service.id}
                  value={service.id}
                  className="animate-pop"
                >
                  <div className="grid gap-8 lg:grid-cols-5">
                    {/* Service narrative */}
                    <Card className="lg:col-span-2">
                      <CardContent className="space-y-5 p-6">
                        <div className="flex items-center gap-3">
                          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <Icon className="size-6" />
                          </span>
                          <div>
                            <h3 className="text-xl font-bold">{service.name}</h3>
                            <p className="text-sm text-primary">
                              {service.shortPitch}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                            What it is
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {service.whatItIs}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                            Why it matters
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {service.whyItMatters}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                            How we deliver
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {service.howWeDeliver}
                          </p>
                        </div>
                        <div className="rounded-xl bg-primary/5 p-4">
                          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">
                            What you can expect
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {service.outcomes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sub-services accordion */}
                    <Card className="lg:col-span-3">
                      <CardContent className="p-6">
                        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                          What&apos;s included — click to explore
                        </h4>
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue={service.subServices[0].title}
                        >
                          {service.subServices.map((sub) => (
                            <AccordionItem key={sub.title} value={sub.title}>
                              <AccordionTrigger className="text-left font-semibold hover:text-primary">
                                {sub.title}
                              </AccordionTrigger>
                              <AccordionContent className="leading-relaxed text-muted-foreground">
                                {sub.description}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
