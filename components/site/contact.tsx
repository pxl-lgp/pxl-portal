"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { fireConfetti } from "@/lib/confetti";
import { createLead } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { contact } from "@/lib/content";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resultModal, setResultModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const contactPerson = String(form.get("name") ?? "");
    const businessName = String(form.get("company") ?? "").trim() || contactPerson;
    const goal = String(form.get("goal") ?? "").trim() || "Not provided";

    setSubmitting(true);
    setError("");

    try {
      await createLead({
        contactPerson,
        email: String(form.get("email") ?? ""),
        businessName,
        source: "Website contact form",
        message: [
          `Main goal: ${goal}`,
          String(form.get("message") ?? ""),
        ].join("\n\n"),
      });
      setSubmitted(true);
      setResultModal({
        type: "success",
        title: contact.successTitle,
        message: contact.successBody,
      });
      fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "We couldn't send your message. Please try again or email us directly."
      );

      setError(message);
      setResultModal({
        type: "error",
        title: "Message Not Sent",
        message,
      });
    } finally {
      setSubmitting(false);
    }
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
                        <Link href="/#services">Explore Services</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => {
                          setError("");
                          setSubmitted(false);
                        }}
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
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : contact.formCta}
                      <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                    {error ? (
                      <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                        {error}
                      </p>
                    ) : null}
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

      {resultModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-result-title"
        >
          <div className="relative w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-2xl animate-pop">
            <button
              type="button"
              onClick={() => setResultModal(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close message status"
            >
              <X className="size-5" />
            </button>
            <div
              className={
                resultModal.type === "success"
                  ? "mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  : "mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
              }
            >
              {resultModal.type === "success" ? (
                <CheckCircle2 className="size-9" />
              ) : (
                <AlertCircle className="size-9" />
              )}
            </div>
            <h3 id="contact-result-title" className="text-2xl font-extrabold">
              {resultModal.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {resultModal.message}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button className="rounded-full" onClick={() => setResultModal(null)}>
                {resultModal.type === "success" ? "Great, thanks" : "Try Again"}
              </Button>
              {resultModal.type === "error" ? (
                <Button asChild variant="outline" className="rounded-full">
                  <a href={`mailto:${contact.email}`}>Email Us Directly</a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
