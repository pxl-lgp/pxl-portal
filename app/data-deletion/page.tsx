import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | PXL",
  description: "Instructions for requesting deletion of data connected to PXL and Meta integrations.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10 lg:px-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">PXL</p>
        <h1 className="mt-3 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Data Deletion Instructions
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: June 22, 2026</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">1. Overview</h2>
            <p className="mt-3">
              This page explains how users can request deletion of personal data, account data, client portal data, or
              Meta authorization data connected to PXL services.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">2. How To Request Deletion</h2>
            <p className="mt-3">To request deletion, send an email to:</p>
            <p className="mt-3 rounded-2xl border border-border bg-background p-4 font-mono text-primary">
              thepxl.official@gmail.com
            </p>
            <p className="mt-3">Include the following details:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Your full name.</li>
              <li>The email address used with PXL or Meta.</li>
              <li>The client, business, Facebook Page, or Instagram account related to the request.</li>
              <li>A short message saying you want your data deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">3. Example Request</h2>
            <div className="mt-3 rounded-2xl border border-border bg-background p-4 font-mono text-sm text-foreground">
              Subject: Data deletion request
              <br />
              <br />
              Hello PXL,
              <br />
              I would like to request deletion of my data connected to PXL services.
              <br />
              My email is: your-email@example.com
              <br />
              Related business/Page: Your Business Name
              <br />
              <br />
              Thank you.
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">4. What We Delete</h2>
            <p className="mt-3">Depending on the request and account type, we may delete:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>User profile information.</li>
              <li>Client portal account data.</li>
              <li>Meta authorization tokens and connected Page records.</li>
              <li>Content approvals, comments, and related workflow data where deletion is appropriate.</li>
              <li>Other personal data associated with your account or request.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">5. Meta Account Disconnection</h2>
            <p className="mt-3">
              You can also remove PXL's access from your Meta account by going to your Facebook or Meta business
              integration settings and removing the connected app. This revokes future access from Meta.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">6. Processing Time</h2>
            <p className="mt-3">
              We will review deletion requests and respond within a reasonable time. Some records may be retained when
              required for legal, security, fraud prevention, accounting, dispute resolution, or legitimate business
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">7. Privacy Policy</h2>
            <p className="mt-3">
              Read our Privacy Policy at{" "}
              <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/privacy">
                /privacy
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
