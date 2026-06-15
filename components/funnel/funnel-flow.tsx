"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarRange,
  Check,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Compass,
  Ellipsis,
  FastForward,
  Globe2,
  Mail,
  MapPin,
  Megaphone,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PxlLogo } from "@/components/site/pxl-logo";
import { fireConfetti } from "@/lib/confetti";
import { funnel } from "@/lib/content";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  target: Target,
  chart: BarChart3,
  clock: Clock3,
  "shopping-cart": ShoppingCart,
  "map-pin": MapPin,
  briefcase: BriefcaseBusiness,
  rocket: Rocket,
  user: UserRound,
  ellipsis: Ellipsis,
  users: UsersRound,
  "circle-dollar": CircleDollarSign,
  megaphone: Megaphone,
  globe: Globe2,
  "circle-help": CircleHelp,
  wallet: WalletCards,
  trending: TrendingUp,
  building: Building2,
  "fast-forward": FastForward,
  calendar: Calendar,
  "calendar-range": CalendarRange,
  compass: Compass,
};

// phases: 0 = intro, 1..steps.length = question steps,
// steps.length + 1 = contact, steps.length + 2 = success
export function FunnelFlow() {
  const totalQuestions = funnel.steps.length;
  const contactPhase = totalQuestions + 1;
  const successPhase = totalQuestions + 2;

  const [phase, setPhase] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress =
    phase === 0 ? 0 : Math.min(((phase - 1) / (contactPhase - 1)) * 100, 100);

  const pick = (stepId: string, value: string) => {
    setAnswers((a) => ({ ...a, [stepId]: value }));
    // brief pause so the selection highlight registers before advancing
    setTimeout(() => setPhase((p) => p + 1), 200);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhase(successPhase);
    fireConfetti(window.innerWidth / 2, window.innerHeight / 3);
  };

  const recommendation =
    funnel.recommendations[answers.goal] ?? funnel.recommendations.unsure;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-[#5ddafc]/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 right-1/4 size-96 rounded-full bg-[#6e81ff]/10 blur-3xl animate-blob [animation-delay:-8s]" />
      </div>

      {/* minimal funnel header — logo home link only, no nav distractions */}
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="inline-block transition-transform duration-300 hover:scale-105"
          aria-label="PXL — Digital Marketing, back to home"
        >
          <PxlLogo className="h-7" />
        </Link>
        <span className="hidden text-right text-xs text-muted-foreground sm:block">
          {funnel.timeHint}
        </span>
      </header>

      {/* progress bar (hidden on intro and success) */}
      {phase > 0 && phase < successPhase && (
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {phase} of {contactPhase}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        {/* ---- intro ---- */}
        {phase === 0 && (
          <div className="text-center animate-pop">
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-4 py-1.5">
              <Sparkles className="size-3.5" />
              {funnel.badge}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              {funnel.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {funnel.subheadline}
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left">
              {funnel.bullets.map((bullet) => {
                const Icon = icons[bullet.icon];
                return (
                  <div
                    key={bullet.text}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                  >
                    <Icon className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">{bullet.text}</span>
                  </div>
                );
              })}
            </div>

            <Button
              size="lg"
              onClick={() => setPhase(1)}
              className="group mt-10 rounded-full bg-white px-10 text-base text-[#0f0f0f] shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-white/85 active:scale-95"
            >
              {funnel.startCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {funnel.trustStrip.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---- question steps ---- */}
        {phase >= 1 && phase <= totalQuestions && (
          <div key={phase} className="animate-pop">
            <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              {funnel.steps[phase - 1].question}
            </h1>
            <p className="mt-3 text-center text-muted-foreground">
              {funnel.steps[phase - 1].hint}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {funnel.steps[phase - 1].options.map((option) => {
                const selected =
                  answers[funnel.steps[phase - 1].id] === option.value;
                const Icon = icons[option.icon];
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => pick(funnel.steps[phase - 1].id, option.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary/60",
                      selected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border"
                    )}
                  >
                    <Icon className="size-5 shrink-0 text-primary" />
                    <span className="flex-1 text-sm font-semibold">
                      {option.label}
                    </span>
                    {selected && <Check className="size-5 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => setPhase((p) => p - 1)}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ---- contact step ---- */}
        {phase === contactPhase && (
          <div className="animate-pop">
            <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              {funnel.contactStep.question}
            </h1>
            <p className="mt-3 text-center text-muted-foreground">
              {funnel.contactStep.hint}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 grid max-w-md gap-5">
              <div className="grid gap-2">
                <Label htmlFor="funnel-name">Your name</Label>
                <Input id="funnel-name" required placeholder="Juan dela Cruz" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="funnel-email">Email address</Label>
                <Input
                  id="funnel-email"
                  type="email"
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="funnel-company">Business name (optional)</Label>
                <Input id="funnel-company" placeholder="Your company" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full bg-white text-base text-[#0f0f0f] transition-transform hover:scale-[1.02] hover:bg-white/85 active:scale-95"
              >
                {funnel.contactStep.submitCta}
                <Mail className="size-4" />
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                {funnel.contactStep.privacyNote}
              </p>
            </form>

            <div className="mt-6 flex justify-center">
              <Button
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => setPhase((p) => p - 1)}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ---- success ---- */}
        {phase === successPhase && (
          <div className="text-center animate-pop">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Check className="size-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {funnel.success.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {funnel.success.body}
            </p>

            <Card className="mx-auto mt-8 max-w-xl border-primary/30 bg-gradient-to-br from-primary/10 to-transparent text-left">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3 rounded-full">
                  Your likely starting point
                </Badge>
                <h2 className="text-xl font-extrabold">{recommendation.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {recommendation.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-[#0f0f0f] transition-transform hover:scale-105 hover:bg-white/85"
              >
                <Link href="/#contact">
                  <CalendarCheck className="size-4" />
                  {funnel.success.bookCta}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link href="/">{funnel.success.homeCta}</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
