"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PxlLogo } from "@/components/site/pxl-logo";
import { fireConfetti } from "@/lib/confetti";
import { company, footer } from "@/lib/content";

// lucide-react v1 dropped brand icons, so these are minimal inline glyphs
type IconProps = React.SVGProps<SVGSVGElement>;

const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
  </svg>
);

const InstagramIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
  </svg>
);

const socials = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: XIcon, label: "X (Twitter)" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubscribed(true);
    fireConfetti(window.innerWidth / 2, window.innerHeight - 150);
  };

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + summary */}
          <div className="space-y-4 lg:col-span-5">
            <a
              href="#top"
              className="inline-block transition-transform duration-300 hover:scale-105"
              aria-label="PXL — Digital Marketing, back to top"
            >
              <PxlLogo className="h-10" tagline />
            </a>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {footer.summary}
            </p>
            <p className="text-sm font-semibold text-primary">{footer.mission}</p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-all hover:-translate-y-1 hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footer.columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        column.title === "Services"
                          ? "#services"
                          : `#${link.toLowerCase().replace(/\s+/g, "-").replace("about-us", "about").replace("our-process", "process")}`
                      }
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">
              Growth Tips Newsletter
            </h4>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {footer.newsletterInvite}
            </p>
            {subscribed ? (
              <p className="rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary animate-pop">
                {footer.newsletterSuccess}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  required
                  placeholder="you@company.com"
                  aria-label="Email for newsletter"
                  className="rounded-full"
                />
                <Button type="submit" className="rounded-full">
                  {footer.newsletterCta}
                </Button>
              </form>
            )}
            <p className="mt-4 text-sm font-medium">
              {footer.footerCta}{" "}
              <a href="#contact" className="text-primary underline-offset-4 hover:underline">
                Let&apos;s talk →
              </a>
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p className="font-medium">{footer.brandMessage}</p>
        </div>
      </div>
    </footer>
  );
}
