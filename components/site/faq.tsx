import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { faq } from "@/lib/content";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-muted/40 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          badge="FAQ"
          title={faq.heading}
          description={faq.intro}
        />

        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faq.items.map((item, i) => (
              <AccordionItem
                key={item.question}
                value={item.question}
                className="rounded-2xl border bg-card px-6 transition-colors data-[state=open]:border-primary/40 last:border-b"
              >
                <AccordionTrigger className="text-left font-bold hover:text-primary hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
