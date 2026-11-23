// The contact form's server route. It runs only on the server, so the secret
// keys (read from .env.local, or Vercel's settings) never reach the browser.
//
// Order of events:
//   1. Spam checks: the hidden honeypot field, and a limit on repeat messages.
//   2. Every field is checked again here (the browser is never trusted).
//   3. The row is saved to Supabase. If that fails, the visitor sees an error.
//   4. Only then are the two emails sent. If an email fails, the visitor still
//      sees success (their message is safely saved) and the error is logged.

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { checkContact, looksLikeBot, type ContactInput } from "../../../lib/contact";
import { acknowledgementEmail, ownerEmail } from "../../../lib/contact-emails";

export const runtime = "nodejs";

const FRIENDLY_SAVE_ERROR =
  "Sorry, we couldn't send your message just now. Please try again in a few minutes.";

// Basic limit on repeat messages:
//  - per connection: 5 messages in 10 minutes (kept in this server's memory, so
//    it resets when the server restarts; a simple first line of defence)
//  - per email address: 3 messages in 10 minutes (checked in the database)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const recentByIp = new Map<string, number[]>();

function tooManyFromIp(ip: string): boolean {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  recentByIp.set(ip, recent);
  if (recentByIp.size > 5000) recentByIp.clear(); // keep memory small
  return recent.length > MAX_PER_IP;
}

type Reply =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string> };

const reply = (body: Reply, status: number) => Response.json(body, { status });

export async function POST(request: Request): Promise<Response> {
  let input: ContactInput;
  try {
    input = await request.json();
  } catch {
    return reply({ ok: false, message: "Something went wrong sending the form. Please try again." }, 400);
  }

  // 1. Spam checks
  if (looksLikeBot(input)) {
    return reply({ ok: false, message: "Sorry, we couldn't send your message. Please try again." }, 400);
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooManyFromIp(ip)) {
    return reply({ ok: false, message: "You've sent a few messages in a row. Please wait a few minutes and try again." }, 429);
  }

  // 2. Check every field
  const check = checkContact(input);
  if (!check.ok) {
    return reply({ ok: false, message: "Please check the highlighted fields.", errors: check.errors }, 400);
  }
  const data = check.data;

  // 3. Save to Supabase with the secret key (it bypasses Row-Level Security)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("[contact] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing, so nothing was saved.");
    return reply({ ok: false, message: FRIENDLY_SAVE_ERROR }, 500);
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", data.email)
    .gte("created_at", since);
  if (countError) {
    console.error("[contact] Couldn't check recent messages:", countError.message);
    return reply({ ok: false, message: FRIENDLY_SAVE_ERROR }, 500);
  }
  if ((count ?? 0) >= MAX_PER_EMAIL) {
    return reply({ ok: false, message: "We've already received a few messages from this email. Please wait a few minutes and try again." }, 429);
  }

  const consentAt = new Date().toISOString();
  const { data: saved, error: saveError } = await supabase
    .from("contact_submissions")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      consent_given: true,
      consent_at: consentAt,
    })
    .select("id")
    .single();

  if (saveError || !saved) {
    console.error("[contact] Saving the message failed:", saveError?.message ?? "no row returned");
    return reply({ ok: false, message: FRIENDLY_SAVE_ERROR }, 500);
  }

  // 4. The row is saved. Now send the emails; a failure here is logged only.
  await sendEmails(data, { id: String(saved.id), consentAt });

  return reply({ ok: true }, 200);
}

type Email = { to: string; replyTo?: string; subject: string; html: string; text: string };

// Two ways to send, chosen by which keys are set:
//  - Gmail with an app password (GMAIL_USER + GMAIL_APP_PASSWORD): works without
//    owning a domain, and reaches anyone's inbox.
//  - Resend (RESEND_API_KEY + CONTACT_FROM_EMAIL): needs a verified domain to
//    email anyone other than your own Resend account.
// Gmail is used if its keys are set; otherwise Resend.
async function sendEmails(data: Parameters<typeof acknowledgementEmail>[0], meta: { id: string; consentAt: string }) {
  const owner = process.env.CONTACT_OWNER_EMAIL;
  const toOwner = ownerEmail(data, meta);
  const toVisitor = acknowledgementEmail(data);
  if (!owner) {
    console.error(`[contact] Message ${meta.id} saved, but emails were not sent: CONTACT_OWNER_EMAIL is missing.`);
    return;
  }
  const emails: [string, Email][] = [
    ["owner notification", { to: owner, replyTo: data.email, ...toOwner }],
    ["acknowledgement", { to: data.email, ...toVisitor }],
  ];

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.CONTACT_FROM_EMAIL;

  let send: (email: Email) => Promise<void>;
  if (gmailUser && gmailPassword) {
    const nodemailer = (await import("nodemailer")).default;
    const gmail = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPassword.replace(/\s+/g, "") },
    });
    // Gmail always sends from your own Gmail address; the name shows as Cherié.
    send = async (email) => {
      await gmail.sendMail({ from: { name: "Cherié", address: gmailUser }, ...email });
    };
  } else if (resendKey && resendFrom) {
    const resend = new Resend(resendKey);
    send = async (email) => {
      const { error } = await resend.emails.send({ from: resendFrom, ...email });
      if (error) throw new Error(error.message);
    };
  } else {
    console.error(`[contact] Message ${meta.id} saved, but emails were not sent: set GMAIL_USER + GMAIL_APP_PASSWORD, or RESEND_API_KEY + CONTACT_FROM_EMAIL.`);
    return;
  }

  const results = await Promise.allSettled(emails.map(([, email]) => send(email)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`[contact] Message ${meta.id} saved, but the ${emails[i][0]} email failed:`, reason);
    }
  });
}
