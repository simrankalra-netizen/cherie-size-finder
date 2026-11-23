"use client";

// The contact form. It checks fields as a courtesy, but the server checks them
// again and is the only thing that talks to Supabase and Resend.
// The visitor only ever sees "sent" after the server confirms the row saved.

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { checkContact, LIMITS, type ContactField } from "../lib/contact";
import { REPLY_WITHIN } from "../lib/contact-emails";
import CherieCharacter from "./CherieCharacter";

type Status = "idle" | "sending" | "sent" | "failed";

const EMPTY = { name: "", email: "", phone: "", message: "", consent: false, website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const [sentName, setSentName] = useState("");

  const set = (change: Partial<typeof EMPTY>) => setForm((f) => ({ ...f, ...change }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setFailure("");

    const local = checkContact(form);
    if (!local.ok) {
      setErrors(local.errors);
      setStatus("idle");
      return;
    }
    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok === true) {
        setSentName(local.data.name.split(" ")[0]);
        setForm(EMPTY);
        setStatus("sent");
        return;
      }
      setErrors(data?.errors ?? {});
      setFailure(data?.message ?? "Sorry, we couldn't send your message just now. Please try again in a few minutes.");
      setStatus("failed");
    } catch {
      setFailure("We couldn't reach our server. Please check your connection and try again.");
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <section className="card contact-done fade" role="status">
        <CherieCharacter mood="happy" size={120} className="char-pop" />
        <h2>Thank you, {sentName}.</h2>
        <p>
          Your message is with us, and we&apos;ll reply within {REPLY_WITHIN}. Look out for a confirmation email from us
          too.
        </p>
        <button type="button" className="secondary-light" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </section>
    );
  }

  const sending = status === "sending";
  const fieldProps = (field: ContactField) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });
  const errorFor = (field: ContactField) =>
    errors[field] ? (
      <span className="field-error" id={`${field}-error`}>
        {errors[field]}
      </span>
    ) : null;

  return (
    <form className="card contact-form" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span className="label">Name</span>
        <input type="text" autoComplete="name" maxLength={LIMITS.name} value={form.name} onChange={(e) => set({ name: e.target.value })} {...fieldProps("name")} />
        {errorFor("name")}
      </label>

      <label className="field">
        <span className="label">Email</span>
        <input type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} value={form.email} onChange={(e) => set({ email: e.target.value })} {...fieldProps("email")} />
        {errorFor("email")}
      </label>

      <label className="field">
        <span className="label">
          Phone <span className="optional">(optional)</span>
        </span>
        <input type="tel" autoComplete="tel" inputMode="tel" maxLength={LIMITS.phone} value={form.phone} onChange={(e) => set({ phone: e.target.value })} {...fieldProps("phone")} />
        {errorFor("phone")}
      </label>

      <label className="field">
        <span className="label">Message</span>
        <textarea rows={6} maxLength={LIMITS.message} value={form.message} onChange={(e) => set({ message: e.target.value })} {...fieldProps("message")} />
        <span className="small counter">
          {form.message.length} / {LIMITS.message}
        </span>
        {errorFor("message")}
      </label>

      {/* Honeypot: hidden from people, usually filled in by spam bots. */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set({ website: e.target.value })} />
        </label>
      </div>

      <div className="field">
        <label className="consent">
          <input type="checkbox" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} {...fieldProps("consent")} />
          <span>
            I agree to Cherié storing my details to reply to my message, as described in the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
        {errorFor("consent")}
      </div>

      {status === "failed" && failure && (
        <div className="form-failure fade" role="alert">
          <CherieCharacter mood="sorry" size={56} />
          <p>{failure}</p>
        </div>
      )}

      <button className="primary" type="submit" disabled={sending} aria-busy={sending}>
        {sending ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
