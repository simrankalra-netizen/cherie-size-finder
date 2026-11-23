// The two emails the contact form sends. All visitor text is escaped before
// it goes into HTML, so nobody can inject links or code into these emails.
// Copy rule: fit and comfort only; no "eco-friendly", "100% biodegradable",
// "carbon neutral" or skin-health claims.

import { escapeHtml, type ContactData } from "./contact";

/** How soon Cherié promises to reply. Change it here if your promise changes. */
export const REPLY_WITHIN = "2 working days";

const CREAM = "#EFEAE3";
const CHERRY = "#5E0B15";
const PAPER = "#F7F2EC";
const BEIGE = "#E6D5BD";
const INK = "#3A2A2C";

const paragraphs = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br>");

function frame(inner: string) {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PAPER};border:1px solid ${BEIGE};border-radius:6px;">
        <tr><td style="padding:32px 28px;font-family:Georgia,'Times New Roman',serif;color:${INK};font-size:16px;line-height:1.6;">
          <p style="margin:0 0 24px;font-size:28px;font-style:italic;color:${CHERRY};">Cherié</p>
          ${inner}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** The automatic reply to the person who wrote in. */
export function acknowledgementEmail(data: ContactData) {
  const firstName = data.name.split(" ")[0];
  const subject = "We've got your message — Cherié";
  const html = frame(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">Thank you for writing to Cherié. We've received your message, and we'll reply within ${REPLY_WITHIN}.</p>
    <p style="margin:0 0 8px;color:${CHERRY};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">Your message</p>
    <p style="margin:0 0 24px;padding:16px;background:${CREAM};border-left:2px solid ${CHERRY};">${paragraphs(data.message)}</p>
    <p style="margin:0;">Warmly,<br>The Cherié team</p>
    <p style="margin:24px 0 0;font-size:12px;color:#6F5F60;font-family:Arial,sans-serif;">You're receiving this because you sent us a message through the Cherié website.</p>
  `);
  const text = `Hi ${firstName},

Thank you for writing to Cherié. We've received your message, and we'll reply within ${REPLY_WITHIN}.

Your message:
${data.message}

Warmly,
The Cherié team

You're receiving this because you sent us a message through the Cherié website.`;
  return { subject, html, text };
}

/** The notification to the website owner, with every field. */
export function ownerEmail(data: ContactData, meta: { id: string; consentAt: string }) {
  const subject = `New message from ${data.name}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;color:${CHERRY};font-family:Arial,sans-serif;font-size:13px;white-space:nowrap;">${label}</td><td style="padding:8px 0;vertical-align:top;">${value}</td></tr>`;
  const html = frame(`
    <p style="margin:0 0 16px;">A new message arrived through the contact form. Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${BEIGE};">
      ${row("Name", escapeHtml(data.name))}
      ${row("Email", escapeHtml(data.email))}
      ${row("Phone", data.phone ? escapeHtml(data.phone) : "Not given")}
      ${row("Message", paragraphs(data.message))}
      ${row("Consent", `Given at ${escapeHtml(meta.consentAt)}`)}
      ${row("Saved as", escapeHtml(meta.id))}
    </table>
  `);
  const text = `New message from ${data.name}

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone ?? "Not given"}
Consent: given at ${meta.consentAt}
Saved as: ${meta.id}

Message:
${data.message}`;
  return { subject, html, text };
}
