import type { Metadata } from "next";
import Link from "next/link";
import { REPLY_WITHIN } from "../../lib/contact-emails";

export const metadata: Metadata = { title: "Privacy Policy" };

// DRAFT: written to describe what this website actually does today.
// Have it reviewed before launch, and fill in every [bracketed] item.

export default function PrivacyPage() {
  return (
    <main className="page prose">
      <header className="fade">
        <span className="label">Privacy Policy</span>
        <h1>Your details, handled with care</h1>
        <p className="intro">Draft: to be reviewed before launch. Last updated [date].</p>
      </header>

      <section className="card fade">
        <h2 className="prose-h">The contact form</h2>
        <p>
          When you send us a message through the <Link href="/contact">contact form</Link>, we store your name, your
          email address, your phone number if you give one, your message, and the date and time you agreed to this
          policy.
        </p>
        <p>
          We use these details only to reply to your message. We aim to reply within {REPLY_WITHIN}. We don&apos;t add you
          to a mailing list and we don&apos;t sell your details.
        </p>
        <p>
          Your message is stored in a secure database run by Supabase, and our emails to you are sent through Resend.
          Only the Cherié team can read your message.
        </p>
        <p>We keep your message for [how long], then delete it.</p>
      </section>

      <section className="card fade">
        <h2 className="prose-h">The size finder</h2>
        <p>
          Your measurements stay on your screen and are never saved. To write your personal fit note, we send only your
          suggested size and your two fit answers to an AI service (Google Gemini). Your measurements are never sent.
        </p>
      </section>

      <section className="card fade">
        <h2 className="prose-h">Your choices</h2>
        <p>
          You can ask us to show you, correct or delete the details you sent us at any time. Write to [contact email
          address] and we&apos;ll take care of it.
        </p>
      </section>
    </main>
  );
}
