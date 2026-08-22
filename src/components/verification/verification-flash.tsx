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

export function VerificationNoWebsite({
  companySlug,
}: {
  companySlug: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-paper/60 px-3.5 py-3 text-[13px] leading-relaxed text-muted">
      <p className="font-medium text-ink">Add a company website first.</p>
      <p className="mt-1">
        Verification looks up the domain from{" "}
        <Link
          href={`/c/${companySlug}/edit`}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Edit profile
        </Link>
        . A TXT record on its own is not enough — save the site URL (the same
        host as the DNS zone), then come back and verify.
      </p>
    </div>
  );
}

export function flashSuccessMessage(
  ok: "email" | "dns" | "meta" | "linked" | "logo" | undefined,
): string | null {
  if (!ok) return null;
  if (ok === "linked") return "Website link found on your homepage.";
  if (ok === "logo") return "Logo refreshed from your website.";
  const via =
    ok === "email" ? "email" : ok === "dns" ? "DNS TXT" : "meta / file";
  return `Domain verified via ${via}. Next: invite a partner.`;
}

export function methodLabel(method: string) {
  if (method === "email_domain") return "Email";
  if (method === "dns_txt") return "DNS TXT";
  if (method === "meta_tag") return "Meta / file";
  return method;
}
