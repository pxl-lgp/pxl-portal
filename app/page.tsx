import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { ClientLogoMarquee } from "@/components/site/client-logo-marquee";
import { About } from "@/components/site/about";
import { Services } from "@/components/site/services";
import { WhyUs } from "@/components/site/why-us";
import { Process } from "@/components/site/process";
import { Results } from "@/components/site/results";
import { Industries } from "@/components/site/industries";
import { Testimonials } from "@/components/site/testimonials";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { BackToTop } from "@/components/site/back-to-top";
import { ChatWidget } from "@/components/site/chat-widget";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Marquee />
      <ClientLogoMarquee />
      <About />
      <Services />
      <WhyUs />
      <Process />
      <Results />
      <Industries />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Contact />
      <Footer />
      <BackToTop />
      <ChatWidget />
    </main>
  );
}
