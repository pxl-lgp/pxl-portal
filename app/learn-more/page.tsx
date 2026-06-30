import type { Metadata } from "next";
import { BackToTop } from "@/components/site/back-to-top";
import { ChatWidget } from "@/components/site/chat-widget";
import { Contact } from "@/components/site/contact";
import { Faq } from "@/components/site/faq";
import { Footer } from "@/components/site/footer";
import { Industries } from "@/components/site/industries";
import { Navbar } from "@/components/site/navbar";
import { Process } from "@/components/site/process";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Testimonials } from "@/components/site/testimonials";
import { WhyUs } from "@/components/site/why-us";

export const metadata: Metadata = {
  title: "Learn More | PXL Digital Marketing",
  description:
    "Explore PXL's process, differentiators, industries served, client success approach, and frequently asked questions.",
};

export default function LearnMorePage() {
  return (
    <main className="overflow-x-clip">
      <ScrollProgress />
      <Navbar />
      <div id="top" className="pt-20" />
      <WhyUs />
      <Process />
      <Industries />
      <Testimonials />
      <Faq />
      <Contact />
      <Footer />
      <BackToTop />
      <ChatWidget />
    </main>
  );
}
