-- Recovery codes reuse signup_email_codes (hashed 4-digit, service_role only).
alter table public.signup_email_codes
  drop constraint if exists signup_email_codes_otp_type_check;

alter table public.signup_email_codes
  add constraint signup_email_codes_otp_type_check
  check (otp_type in ('signup', 'magiclink', 'recovery'));
