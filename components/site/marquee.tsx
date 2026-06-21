import { Zap } from "lucide-react";
import { marqueeItems } from "@/lib/content";

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div
      className={`flex w-max gap-8 whitespace-nowrap group-hover:[animation-play-state:paused] ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
    >
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
        >
          <Zap className="size-4 text-[#0f0f0f]/70" />
          {item}
        </span>
      ))}
    </div>
  );
}

/** Scrolling strip of service keywords; pauses on hover. */
export function Marquee() {
  return (
    <div className="group relative overflow-hidden border-y bg-primary py-3 text-primary-foreground">
      <Row />
    </div>
  );
}
