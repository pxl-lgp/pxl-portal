import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <SectionHeading
          badge="Client Success"
          title={testimonials.heading}
          description={testimonials.supporting}
        />

        <Reveal>
          <div className="relative mx-auto max-w-2xl rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-10">
            <Quote className="absolute -top-5 left-8 size-10 rounded-full bg-background p-2 text-primary" />
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-6 fill-[#e3af20] text-[#e3af20] transition-transform hover:scale-125"
                />
              ))}
            </div>
            <p className="text-xl font-bold">{testimonials.placeholder}</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {testimonials.importance}
            </p>
            <Button asChild className="mt-6 rounded-full">
              <a href="#contact">Start Your Success Story</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
