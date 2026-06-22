import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PXL",
  description: "Privacy Policy for PXL digital marketing services and connected Meta integrations.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10 lg:px-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">PXL</p>
        <h1 className="mt-3 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: June 22, 2026</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">1. Overview</h2>
            <p className="mt-3">
              PXL operates digital marketing, content management, automation, and client portal services. This Privacy
              Policy explains how we collect, use, store, and protect information when clients, team members, page
              owners, or website visitors use our services.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">2. Information We Collect</h2>
            <p className="mt-3">We may collect the following information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Name, email address, role, and account profile details.</li>
              <li>Client business information submitted through onboarding forms or the client portal.</li>
              <li>Content records, captions, media URLs, campaigns, approvals, reports, and analytics records.</li>
              <li>Authentication and authorization data required to connect third-party services.</li>
              <li>Meta Page, Instagram account, and related authorization data approved by the page owner.</li>
              <li>Technical information such as request logs, device/browser details, and usage activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">3. How We Use Information</h2>
            <p className="mt-3">We use information to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Provide agency, content, automation, reporting, and client portal services.</li>
              <li>Create, schedule, publish, and track approved client content.</li>
              <li>Manage client approvals, revision requests, and internal workflows.</li>
              <li>Connect to Meta services when a page owner authorizes access.</li>
              <li>Improve security, monitor system health, and prevent unauthorized access.</li>
              <li>Respond to support, privacy, and deletion requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">4. Meta Platform Data</h2>
            <p className="mt-3">
              If a user connects a Meta account, we only request permissions needed to list authorized Pages, read basic
              Page or Instagram account information, and publish approved content on behalf of the connected Page or
              Instagram business account. We do not sell Meta data. Access can be revoked by disconnecting the account
              in the portal or from Meta's business integration settings.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">5. Sharing Of Information</h2>
            <p className="mt-3">
              We do not sell personal information. We may share limited information with service providers that help us
              operate the platform, including hosting, database, email, analytics, cloud storage, and third-party API
              providers. We may also disclose information if required by law or to protect the security of our services.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">6. Data Storage And Security</h2>
            <p className="mt-3">
              We use reasonable technical and organizational safeguards to protect information from unauthorized access,
              loss, misuse, or alteration. No system is completely secure, but we work to limit access to authorized users
              and protect sensitive credentials where applicable.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">7. Data Retention</h2>
            <p className="mt-3">
              We keep information for as long as needed to provide services, maintain business records, comply with legal
              obligations, resolve disputes, and enforce agreements. If an account or integration is removed, related data
              may be deleted or retained only where required for legitimate business or legal reasons.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">8. User Choices</h2>
            <p className="mt-3">Users may request access, correction, or deletion of their information by contacting us.</p>
            <p className="mt-3">
              For data deletion instructions, visit{" "}
              <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/data-deletion">
                /data-deletion
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">9. Contact</h2>
            <p className="mt-3">
              For privacy questions or deletion requests, contact us at{" "}
              <a className="font-semibold text-primary underline-offset-4 hover:underline" href="mailto:thepxl.official@gmail.com">
                thepxl.official@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
