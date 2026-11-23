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

async function sendEmails(data: Parameters<typeof acknowledgementEmail>[0], meta: { id: string; consentAt: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const owner = process.env.CONTACT_OWNER_EMAIL;
  if (!apiKey || !from || !owner) {
    console.error(`[contact] Message ${meta.id} saved, but emails were not sent: RESEND_API_KEY, CONTACT_FROM_EMAIL or CONTACT_OWNER_EMAIL is missing.`);
    return;
  }

  const resend = new Resend(apiKey);
  const toOwner = ownerEmail(data, meta);
  const toVisitor = acknowledgementEmail(data);

  const results = await Promise.allSettled([
    resend.emails.send({ from, to: owner, replyTo: data.email, subject: toOwner.subject, html: toOwner.html, text: toOwner.text }),
    resend.emails.send({ from, to: data.email, subject: toVisitor.subject, html: toVisitor.html, text: toVisitor.text }),
  ]);

  results.forEach((result, i) => {
    const which = i === 0 ? "owner notification" : "acknowledgement";
    if (result.status === "rejected") {
      console.error(`[contact] Message ${meta.id} saved, but the ${which} email failed:`, result.reason instanceof Error ? result.reason.message : result.reason);
    } else if (result.value.error) {
      console.error(`[contact] Message ${meta.id} saved, but the ${which} email failed:`, result.value.error.message);
    }
  });
}
