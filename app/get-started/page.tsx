import type { Metadata } from "next";
import { FunnelFlow } from "@/components/funnel/funnel-flow";

export const metadata: Metadata = {
  title: "Get Your Free Growth Plan — PXL Digital Marketing",
  description:
    "Answer five quick questions and get a free custom marketing growth plan for your business — your biggest opportunities, recommended channels, and realistic projections. No obligation.",
  robots: { index: false }, // funnel pages are for ad/CTA traffic, not search
};

export default function GetStartedPage() {
  return <FunnelFlow />;
}
