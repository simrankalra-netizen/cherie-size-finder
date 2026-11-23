// Automatic checks for the contact form rules. Run with: npm test
import { describe, expect, it } from "vitest";
import { checkContact, escapeHtml, looksLikeBot } from "./contact";

const good = { name: "Ananya", email: "ananya@example.com", phone: "", message: "Hello, when is the first drop?", consent: true };

describe("contact form checks", () => {
  it("accepts a normal message", () => {
    const r = checkContact(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ name: "Ananya", email: "ananya@example.com", phone: null, message: "Hello, when is the first drop?" });
  });

  it("tidies spaces and lower-cases the email", () => {
    const r = checkContact({ ...good, name: "  Ananya   Rao ", email: " Ananya@Example.COM " });
    expect(r.ok && r.data).toMatchObject({ name: "Ananya Rao", email: "ananya@example.com" });
  });

  it.each([
    ["missing name", { name: "" }, "name"],
    ["name too long", { name: "a".repeat(101) }, "name"],
    ["missing email", { email: "" }, "email"],
    ["bad email", { email: "ananya@" }, "email"],
    ["email with spaces", { email: "an anya@example.com" }, "email"],
    ["phone with letters", { phone: "call me" }, "phone"],
    ["phone too short", { phone: "123" }, "phone"],
    ["missing message", { message: " " }, "message"],
    ["message too short", { message: "hi" }, "message"],
    ["message too long", { message: "a".repeat(2001) }, "message"],
    ["consent not ticked", { consent: false }, "consent"],
    ["consent sent as text", { consent: "true" }, "consent"],
  ] as [string, object, string][])("rejects %s", (_name, change, field) => {
    const r = checkContact({ ...good, ...change });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors).toHaveProperty(field);
  });

  it("accepts a normal phone number", () => {
    expect(checkContact({ ...good, phone: "+91 98765 43210" }).ok).toBe(true);
  });

  it("spots the honeypot", () => {
    expect(looksLikeBot({ ...good, website: "spam.example" })).toBe(true);
    expect(looksLikeBot(good)).toBe(false);
  });

  it("makes text safe for HTML emails", () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;");
  });
});
