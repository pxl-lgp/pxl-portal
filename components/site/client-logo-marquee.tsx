import Image from "next/image";

const clientLogos = [
  { src: "/client-logos/SUBCONIFY SOLUTIONS LOGO.png", alt: "Subconify Solutions", scale: 1.75 },
  { src: "/client-logos/SAMGYUP ON THE GO LOGO.png", alt: "Samgyup On The Go", scale: 2.15 },
  { src: "/client-logos/NURTURA HOME CARE LOGO.png", alt: "Nurtura Home Care", scale: 1.08 },
  { src: "/client-logos/MUTYA_S LOGO.png", alt: "Mutya's", scale: 1.08 },
  { src: "/client-logos/LUMEN LOGO.png", alt: "Lumen", scale: 1.55 },
  { src: "/client-logos/LOFT 42 LOGO.png", alt: "Loft 42", scale: 1.3 },
  { src: "/client-logos/GOLDEN DRAGON LOGO.png", alt: "Golden Dragon", scale: 1.6 },
  { src: "/client-logos/BATAS AUTO MECHANIC LOGO.png", alt: "Batas Auto Mechanic", scale: 1.3 },
  { src: "/client-logos/ARCHANGEL SENIOR CARE HOME LOGO.png", alt: "Archangel Senior Care Home", scale: 1.12 },
];

function LogoRow() {
  const logoSet = [...clientLogos, ...clientLogos, ...clientLogos];
  const items = [...logoSet, ...logoSet];

  return (
    <div className="flex w-max items-center gap-1 group-hover:[animation-play-state:paused] animate-marquee">
      {items.map((logo, index) => (
        <div
          key={`${logo.src}-${index}`}
          className="flex h-28 w-36 shrink-0 items-center justify-center overflow-visible sm:h-32 sm:w-44"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={360}
            height={160}
            className="max-h-28 w-auto max-w-none object-contain opacity-75 grayscale invert transition duration-300 hover:opacity-100 hover:grayscale-0 sm:max-h-32 dark:opacity-85 dark:invert-0"
            style={{ transform: `scale(${logo.scale})` }}
          />
        </div>
      ))}
    </div>
  );
}

export function ClientLogoMarquee() {
  return (
    <section
      aria-label="Client logos"
      className="relative overflow-hidden bg-[#141414] py-8 sm:py-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),rgba(255,255,255,0)_34%),linear-gradient(90deg,#101010_0%,#3d3d3a_50%,#101010_100%)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.9)_0.8px,transparent_0.8px)] [background-size:4px_4px]" />
      <div className="group relative overflow-hidden bg-gradient-to-r from-[#101010] via-[#2f2f2d] to-[#101010] py-6 shadow-2xl shadow-black/40">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#101010] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#101010] to-transparent" />
        <LogoRow />
      </div>
    </section>
  );
}
