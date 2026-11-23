-- Cherié contact form table.
-- Paste this into Supabase: your project → SQL Editor → New query → paste → Run.
-- Run it once. It creates the table and locks it so the public website key
-- can never read or write it. Only the server (with the secret key) can.

create table public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 1 and 100),
  email         text not null check (char_length(email) between 3 and 254),
  phone         text check (phone is null or char_length(phone) <= 30),
  message       text not null check (char_length(message) between 1 and 2000),
  consent_given boolean not null check (consent_given = true),
  consent_at    timestamptz not null
);

-- Row-Level Security ON, with NO policies: nobody can read or write this
-- table from the browser. The server's secret (service role) key bypasses
-- RLS, which is how the contact form saves rows.
alter table public.contact_submissions enable row level security;

-- Belt and braces: also remove the public roles' table permissions.
revoke all on table public.contact_submissions from anon, authenticated;

-- Helps the "too many messages from this email" check run quickly.
create index contact_submissions_email_created_at_idx
  on public.contact_submissions (email, created_at desc);
