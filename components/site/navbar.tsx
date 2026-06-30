"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PxlLogo } from "@/components/site/pxl-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  sectionId?: string;
};

const links: NavLink[] = [
  { href: "/#services", label: "Services", sectionId: "services" },
  { href: "/#results", label: "Results", sectionId: "results" },
  { href: "/#about", label: "About", sectionId: "about" },
  { href: "/learn-more", label: "Learn More" },
  { href: "/#contact", label: "Contact", sectionId: "contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => (l.sectionId ? document.getElementById(l.sectionId) : null))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 z-50 px-4 transition-all duration-300 sm:px-6",
        scrolled ? "top-4" : "top-0"
      )}
    >
      <nav
        className={cn(
          "mx-auto flex h-16 items-center justify-between px-4 transition-all duration-300 sm:px-6",
          scrolled
            ? "max-w-6xl rounded-full border border-border/70 bg-background/90 shadow-[0_20px_55px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:shadow-[0_20px_55px_rgba(0,0,0,0.36)]"
            : "max-w-7xl border border-transparent bg-transparent shadow-none"
        )}
      >
        <Link
          href="/#top"
          className="transition-transform duration-300 hover:scale-105"
          aria-label="PXL — Digital Marketing, back to top"
        >
          <PxlLogo className="h-7" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                active === link.sectionId
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button
            asChild
            variant="ghost"
            className="hidden rounded-full text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="hidden rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/85 sm:inline-flex dark:bg-white dark:text-[#0f0f0f] dark:hover:bg-white/85"
          >
            <Link href="/get-started">Get My Free Growth Plan</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-border/70 bg-background/95 shadow-xl shadow-slate-950/10 backdrop-blur-xl lg:hidden dark:border-white/10 dark:shadow-black/30">
          <div className="mx-auto grid max-w-7xl gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Client Login
            </Link>
            <ThemeToggle className="mt-2 justify-self-start" showLabel />
            <Button
              asChild
              className="mt-2 rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/85 dark:bg-white dark:text-[#0f0f0f] dark:hover:bg-white/85"
            >
              <Link href="/get-started" onClick={() => setOpen(false)}>
                Get My Free Growth Plan
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
