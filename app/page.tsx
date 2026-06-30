import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { ClientLogoMarquee } from "@/components/site/client-logo-marquee";
import { About } from "@/components/site/about";
import { Services } from "@/components/site/services";
import { Results } from "@/components/site/results";
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
      <Services />
      <Results />
      <About />
      <FinalCta />
      <Contact />
      <Footer />
      <BackToTop />
      <ChatWidget />
    </main>
  );
}
