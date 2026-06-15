import Link from "next/link";
import { CalendarCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/magnetic";
import { Reveal } from "@/components/site/reveal";
import { finalCta } from "@/lib/content";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 py-24">
      {/* darker panel set off from the page by hairline borders and a cyan glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1f1f20] via-[#0c0c0d] to-black" aria-hidden />
      <div className="absolute -top-20 right-10 size-72 rounded-full bg-[#5ddafc]/20 blur-3xl animate-blob" aria-hidden />
      <div className="absolute -bottom-24 left-10 size-80 rounded-full bg-[#6e81ff]/15 blur-3xl animate-blob [animation-delay:-8s]" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {finalCta.supporting}
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur transition-transform hover:scale-[1.02]">
              <CalendarCheck className="mb-3 size-7 text-[#5ddafc]" />
              <p className="text-sm leading-relaxed text-white/90">
                {finalCta.consultationInvite}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur transition-transform hover:scale-[1.02]">
              <FileText className="mb-3 size-7 text-[#5ddafc]" />
              <p className="text-sm leading-relaxed text-white/90">
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
                className="rounded-full bg-white px-8 text-base font-bold text-[#0f0f0f] shadow-xl hover:bg-white/90 active:scale-95"
              >
                <Link href="/get-started">{finalCta.primaryCta}</Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white active:scale-95"
              >
                <a href="#contact">{finalCta.secondaryCta}</a>
              </Button>
            </Magnetic>
          </div>
          <p className="mt-6 text-sm text-white/75">
            {finalCta.contactEncouragement}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
