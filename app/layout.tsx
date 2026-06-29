import type { Metadata } from "next";
import { Antonio, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/portal/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PXL — Digital Marketing | Full-Service Agency",
  description:
    "PXL helps brands and organizations grow through social media management, digital advertising, content marketing, website solutions, and brand development. One partner. Every channel. Measurable growth.",
  keywords: [
    "digital marketing agency",
    "social media management",
    "digital advertising",
    "content marketing",
    "website solutions",
    "brand development",
    "lead generation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${antonio.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
