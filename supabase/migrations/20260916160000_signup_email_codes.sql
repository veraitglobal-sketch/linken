-- Signup confirmation codes (4 digits). Service role only — never exposed to clients.
create table public.signup_email_codes (
  email text primary key,
  code_hash text not null,
  token_hash text not null,
  otp_type text not null check (otp_type in ('signup', 'magiclink')),
  next_path text not null default '/onboarding',
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.signup_email_codes is
  'Hashed 4-digit signup codes. No client grants; service_role writes via the app.';

alter table public.signup_email_codes enable row level security;

revoke all on public.signup_email_codes from public, anon, authenticated;
