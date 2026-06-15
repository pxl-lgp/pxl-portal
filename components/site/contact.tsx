"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { fireConfetti } from "@/lib/confetti";
import { contact } from "@/lib/content";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
  };

  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          badge="Contact Us"
          title={contact.heading}
          description={contact.intro}
        />

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info panel */}
          <Reveal from="left" className="lg:col-span-2">
            <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="flex h-full flex-col gap-6 p-8">
                <p className="leading-relaxed text-muted-foreground">
                  {contact.invitation}
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  {contact.encouragement}
                </p>
                <div className="mt-auto space-y-4">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </span>
                    {contact.email}
                  </a>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </span>
                    {contact.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </span>
                    {contact.address}
                  </div>
                </div>
                <p className="text-sm font-semibold">{contact.closing}</p>
              </CardContent>
            </Card>
          </Reveal>

          {/* Form */}
          <Reveal from="right" className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-center animate-pop">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-2xl font-extrabold">
                      {contact.successTitle}
                    </h3>
                    <p className="max-w-md text-muted-foreground">
                      {contact.successBody}
                    </p>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="rounded-full">
                        <a href="#services">Explore Services</a>
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setSubmitted(false)}
                      >
                        Send another message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Your name</Label>
                        <Input id="name" name="name" placeholder="Juan dela Cruz" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="company">Business / organization</Label>
                        <Input id="company" name="company" placeholder="Your company name" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal">Main goal</Label>
                        <Input
                          id="goal"
                          name="goal"
                          placeholder="e.g. more leads, brand refresh…"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Tell us about your business and goals</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="What are you selling, who are your customers, and what would success look like in 6 months?"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="group rounded-full text-base transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      {contact.formCta}
                      <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Free consultation · No obligation · Reply within one business day
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
