// Plain-code checks for the contact form. The server runs these on every
// submission (the browser runs them too, but the server never trusts it).

export type ContactField = "name" | "email" | "phone" | "message" | "consent";

export type ContactInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown; // the hidden honeypot: real people leave it empty
};

export type ContactData = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

export type ContactCheck =
  | { ok: true; data: ContactData }
  | { ok: false; errors: Partial<Record<ContactField, string>> };

export const LIMITS = { name: 100, email: 254, phone: 30, messageMin: 5, message: 2000 };

// Simple and sensible: something@something.something, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits, spaces, +, -, ( and ), with at least 7 digits.
const PHONE = /^[+\d\s()-]+$/;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** True when the hidden honeypot field was filled in, which usually means a bot. */
export function looksLikeBot(input: ContactInput): boolean {
  return text(input.website) !== "";
}

export function checkContact(input: ContactInput): ContactCheck {
  const name = text(input.name).replace(/\s+/g, " ");
  const email = text(input.email).toLowerCase();
  const phone = text(input.phone);
  const message = text(input.message);
  const errors: Partial<Record<ContactField, string>> = {};

  if (!name) errors.name = "Please tell us your name.";
  else if (name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!email) errors.email = "Please add your email so we can reply.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "That email doesn't look quite right. Could you check it?";

  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (phone.length > LIMITS.phone || !PHONE.test(phone) || digits < 7) {
      errors.phone = "That phone number doesn't look quite right. It's optional, so you can leave it empty.";
    }
  }

  if (!message) errors.message = "Please write your message.";
  else if (message.length < LIMITS.messageMin) errors.message = "Could you tell us a little more?";
  else if (message.length > LIMITS.message) errors.message = `Please keep your message under ${LIMITS.message} characters.`;

  if (input.consent !== true) errors.consent = "Please tick the box so we can store your details to reply.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, phone: phone || null, message } };
}

/** Makes user text safe to put inside an HTML email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
