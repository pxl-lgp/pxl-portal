import Link from "next/link";
import { CalendarCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/magnetic";
import { Reveal } from "@/components/site/reveal";
import { finalCta } from "@/lib/content";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-y py-24 dark:border-white/10">
      {/* darker panel set off from the page by hairline borders and a cyan glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#edf5fa] via-white to-[#e8f0f6] dark:from-[#1f1f20] dark:via-[#0c0c0d] dark:to-black" aria-hidden />
      <div className="absolute -top-20 right-10 size-72 rounded-full bg-[#5ddafc]/25 blur-3xl animate-blob dark:bg-[#5ddafc]/20" aria-hidden />
      <div className="absolute -bottom-24 left-10 size-80 rounded-full bg-[#6e81ff]/18 blur-3xl animate-blob [animation-delay:-8s] dark:bg-[#6e81ff]/15" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 text-center text-foreground sm:px-6 dark:text-white">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground dark:text-white/85">
            {finalCta.supporting}
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-card/90 p-6 text-card-foreground shadow-xl shadow-slate-950/10 ring-1 ring-border/70 backdrop-blur transition-transform hover:scale-[1.02] dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-0">
              <CalendarCheck className="mb-3 size-7 text-[#5ddafc]" />
              <p className="text-sm leading-relaxed text-muted-foreground dark:text-white/90">
                {finalCta.consultationInvite}
              </p>
            </div>
            <div className="rounded-2xl bg-card/90 p-6 text-card-foreground shadow-xl shadow-slate-950/10 ring-1 ring-border/70 backdrop-blur transition-transform hover:scale-[1.02] dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-0">
              <FileText className="mb-3 size-7 text-[#5ddafc]" />
              <p className="text-sm leading-relaxed text-muted-foreground dark:text-white/90">
                {finalCta.proposalInvite}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/85 active:scale-95 dark:bg-white dark:text-[#0f0f0f] dark:hover:bg-white/90"
              >
                <Link href="/get-started">{finalCta.primaryCta}</Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-background/70 px-8 text-base text-foreground hover:bg-muted hover:text-foreground active:scale-95 dark:border-white/40 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              >
                <a href="#contact">{finalCta.secondaryCta}</a>
              </Button>
            </Magnetic>
          </div>
          <p className="mt-6 text-sm text-muted-foreground dark:text-white/75">
            {finalCta.contactEncouragement}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
