"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/site/count-up";
import { Magnetic } from "@/components/site/magnetic";
import { hero } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const blobsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Rotating headline word
  useEffect(() => {
    const interval = setInterval(() => {
      setSwapping(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % hero.headlineRotatingWords.length);
        setSwapping(false);
      }, 250);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Subtle mouse parallax on background blobs
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = blobsRef.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll-linked exit: hero content drifts up and fades as you scroll past it
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = contentRef.current;
        if (!el) return;
        const progress = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
        el.style.opacity = `${1 - progress * 0.9}`;
        el.style.transform = `translateY(${progress * -60}px) scale(${1 - progress * 0.04})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* floating gradient blobs */}
      <div
        ref={blobsRef}
        className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/4 size-96 rounded-full bg-[#6e81ff]/15 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 size-80 rounded-full bg-[#5ddafc]/15 blur-3xl animate-blob [animation-delay:-5s]" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-[#e3af20]/10 blur-3xl animate-blob [animation-delay:-10s]" />
      </div>

      <div
        ref={contentRef}
        className="relative mx-auto max-w-7xl px-4 text-center will-change-transform sm:px-6"
      >
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-sm animate-pop"
        >
          <Sparkles className="size-3.5" />
          {hero.eyebrow}
        </Badge>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          {hero.headlinePrefix}{" "}
          <span
            className={cn(
              "inline-block bg-gradient-to-r from-[#5ddafc] via-[#6e81ff] to-[#5ddafc] bg-clip-text text-transparent transition-all duration-300 [background-size:200%_auto] animate-gradient-x",
              swapping ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            {hero.headlineRotatingWords[wordIndex]}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
          {hero.supportingHeadline}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          {hero.introduction}
        </p>

        <p className="mx-auto mt-6 max-w-xl text-base font-semibold text-foreground">
          {hero.valueProposition}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Magnetic>
            <Button
              asChild
              size="lg"
              className="group rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/85 active:scale-95 dark:bg-white dark:text-[#0f0f0f] dark:hover:bg-white/85"
            >
              <Link href="/get-started">
                {hero.primaryCta}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-base active:scale-95"
            >
              <a href="#services">{hero.secondaryCta}</a>
            </Button>
          </Magnetic>
        </div>

        {/* animated stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {hero.stats.map((stat) => (
            <div key={stat.label} className="group cursor-default">
              <div className="text-3xl font-extrabold text-primary transition-transform group-hover:scale-110 sm:text-4xl">
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <a
          href="#about"
          className="mt-14 inline-flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Scroll to explore
          <ArrowDown className="size-4 animate-bounce-slow" />
        </a>
      </div>
    </section>
  );
}
