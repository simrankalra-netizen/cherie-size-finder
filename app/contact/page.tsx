import type { Metadata } from "next";
import ContactForm from "../../components/ContactForm";
import { REPLY_WITHIN } from "../../lib/contact-emails";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="page">
      <header className="fade">
        <span className="label">Contact</span>
        <h1>Write to Cherié</h1>
        <p className="intro">
          A question about fit, sizing or the first drop? Send us a note and we&apos;ll reply within {REPLY_WITHIN}.
        </p>
      </header>
      <ContactForm />
    </main>
  );
}
