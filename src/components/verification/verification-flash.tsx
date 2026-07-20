import Link from "next/link";

export function VerificationSuccess({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-blue/25 bg-accent-soft px-3.5 py-2.5 text-[13px] font-medium text-ink"
    >
      {message}
    </p>
  );
}

export function VerificationError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-ember/30 bg-ember/10 px-3.5 py-2.5"
    >
      <p className="text-[13px] font-semibold text-ink">Verification failed</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">{message}</p>
    </div>
  );
}

export function VerificationNoWebsite() {
  return (
    <div className="rounded-xl border border-line bg-paper/60 px-3.5 py-3 text-[13px] text-muted">
      Add a company website in{" "}
      <Link
        href="/dashboard/settings"
        className="font-semibold text-ink underline-offset-2 hover:underline"
      >
        Settings
      </Link>
      , then return here to verify.
    </div>
  );
}

export function flashSuccessMessage(
  ok: "email" | "dns" | "meta" | "linked" | "logo" | undefined,
): string | null {
  if (!ok) return null;
  if (ok === "linked") return "Website link found on your homepage.";
  if (ok === "logo") return "Logo refreshed from your website.";
  return `Domain verified via ${ok === "email" ? "email" : ok === "dns" ? "DNS TXT" : "meta / file"}.`;
}

export function methodLabel(method: string) {
  if (method === "email_domain") return "Email";
  if (method === "dns_txt") return "DNS TXT";
  if (method === "meta_tag") return "Meta / file";
  return method;
}
