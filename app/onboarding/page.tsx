import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = {
  title: "Client Onboarding — PXL Digital Marketing",
  description:
    "Share your business details so the PXL team can set up your workspace and start building your content plan.",
  robots: { index: false }, // private intake link shared with won clients only
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
