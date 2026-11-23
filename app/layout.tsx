import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"], // italic for the wordmark, like the logo
  variable: "--font-heading",
});
const body = Jost({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Cherié · The soft wire-free bralette", template: "%s · Cherié" },
  description: "Cherié makes soft, wire-free lingerie for warm days, sized with care. Find your size in a minute.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="wordmark">
              Cherié
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/#bralette" className="nav-link">
                The bralette
              </Link>
              <Link href="/#promise" className="nav-link">
                Our promise
              </Link>
              <Link href="/#faq" className="nav-link">
                FAQ
              </Link>
              <Link href="/size-finder" className="primary btn-small">
                Find your size
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="wrap footer-inner">
            <div>
              <Link href="/" className="wordmark">
                Cherié
              </Link>
              <p className="footer-line">Soft, wire-free lingerie for warm days, sized with care.</p>
            </div>
            <nav className="footer-nav" aria-label="Footer">
              <Link href="/#bralette">The bralette</Link>
              <Link href="/size-finder">Find your size</Link>
              <Link href="/#promise">Our promise</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
          </div>
          <p className="wrap footer-small">© 2026 Cherié</p>
        </footer>
      </body>
    </html>
  );
}
