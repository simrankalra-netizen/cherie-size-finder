import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const heading = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], variable: "--font-heading" });
const body = Jost({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Find your Cherié size",
  description: "Answer a few quick questions and get your Cherié bralette size.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
