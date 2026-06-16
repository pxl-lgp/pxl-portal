"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PxlLogo } from "@/components/site/pxl-logo";
import { fireConfetti } from "@/lib/confetti";
import { submitOnboarding } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { ClientPayload } from "@/lib/types";

type OnboardingValues = {
  businessName: string;
  contactPerson: string;
  email: string;
  industry: string;
  phone: string;
  facebook: string;
  instagram: string;
  website: string;
  goals: string;
  brandNotes: string;
  servicesNeeded: string;
};

const emptyValues: OnboardingValues = {
  businessName: "",
  contactPerson: "",
  email: "",
  industry: "",
  phone: "",
  facebook: "",
  instagram: "",
  website: "",
  goals: "",
  brandNotes: "",
  servicesNeeded: "",
};

export function OnboardingForm() {
  const [values, setValues] = useState<OnboardingValues>(emptyValues);
  const mutation = useMutation({
    mutationFn: (payload: ClientPayload) => submitOnboarding(payload),
    onSuccess: () => {
      fireConfetti(window.innerWidth / 2, window.innerHeight / 3);
    },
  });

  function updateValue<K extends keyof OnboardingValues>(key: K, value: OnboardingValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const socialLinks: Record<string, string> = {};
    if (values.facebook.trim()) socialLinks.facebook = values.facebook.trim();
    if (values.instagram.trim()) socialLinks.instagram = values.instagram.trim();
    if (values.website.trim()) socialLinks.website = values.website.trim();

    mutation.mutate({
      businessName: values.businessName.trim(),
      contactPerson: values.contactPerson.trim(),
      email: values.email.trim().toLowerCase(),
      industry: values.industry.trim() || undefined,
      phone: values.phone.trim() || undefined,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      goals: values.goals.trim() || undefined,
      brandNotes: values.brandNotes.trim() || undefined,
      servicesNeeded: values.servicesNeeded
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-[#5ddafc]/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 right-1/4 size-96 rounded-full bg-[#6e81ff]/10 blur-3xl animate-blob [animation-delay:-8s]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105" aria-label="PXL — back to home">
          <PxlLogo className="h-7" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        {mutation.isSuccess ? (
          <div className="text-center animate-pop">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Check className="size-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">You&apos;re all set!</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Thanks, {values.contactPerson.trim() || "there"}. We&apos;ve received your details and the PXL team is
              setting up your workspace. We&apos;ll be in touch shortly.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full px-8">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <div className="animate-pop">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tell us about your business</h1>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                A few details so we can set up your workspace and start building your content plan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 grid max-w-xl gap-5">
              {mutation.isError ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {getApiErrorMessage(mutation.error, "Could not submit your details. Please try again.")}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  onChange={(event) => updateValue("businessName", event.target.value)}
                  required
                  placeholder="Your company"
                  value={values.businessName}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Contact person</Label>
                  <Input
                    id="contactPerson"
                    onChange={(event) => updateValue("contactPerson", event.target.value)}
                    required
                    placeholder="Juan dela Cruz"
                    value={values.contactPerson}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    onChange={(event) => updateValue("email", event.target.value)}
                    required
                    placeholder="you@company.com"
                    value={values.email}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    onChange={(event) => updateValue("industry", event.target.value)}
                    placeholder="Restaurant, real estate, IT…"
                    value={values.industry}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    onChange={(event) => updateValue("phone", event.target.value)}
                    placeholder="+63 917 123 4567"
                    value={values.phone}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    onChange={(event) => updateValue("facebook", event.target.value)}
                    placeholder="facebook.com/…"
                    value={values.facebook}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    onChange={(event) => updateValue("instagram", event.target.value)}
                    placeholder="instagram.com/…"
                    value={values.instagram}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    onChange={(event) => updateValue("website", event.target.value)}
                    placeholder="yoursite.com"
                    value={values.website}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goals">What are your goals?</Label>
                <Textarea
                  id="goals"
                  className="min-h-24"
                  onChange={(event) => updateValue("goals", event.target.value)}
                  placeholder="e.g. Increase bookings and promote weekly offers."
                  value={values.goals}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brandNotes">Brand notes (optional)</Label>
                <Textarea
                  id="brandNotes"
                  className="min-h-24"
                  onChange={(event) => updateValue("brandNotes", event.target.value)}
                  placeholder="Tone, colors, do's and don'ts…"
                  value={values.brandNotes}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="servicesNeeded">Services needed (optional)</Label>
                <Input
                  id="servicesNeeded"
                  onChange={(event) => updateValue("servicesNeeded", event.target.value)}
                  placeholder="content strategy, reels, monthly reporting"
                  value={values.servicesNeeded}
                />
                <p className="text-xs text-muted-foreground">Separate multiple services with commas.</p>
              </div>

              <Button disabled={mutation.isPending} type="submit" size="lg" className="rounded-full">
                {mutation.isPending ? "Submitting…" : "Submit details"}
                <Rocket className="size-4" />
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Your information is only used to set up your account.
              </p>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
