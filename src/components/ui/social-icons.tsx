import { cn } from "@/lib/cn";

type Props = {
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  className?: string;
  /** dark = white icons on forest hero; light = ink icons */
  tone?: "dark" | "light";
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  );
}

export function SocialIcons({
  linkedinUrl,
  facebookUrl,
  className,
  tone = "light",
}: Props) {
  const links = [
    linkedinUrl
      ? { href: linkedinUrl, label: "LinkedIn", Icon: LinkedInIcon }
      : null,
    facebookUrl
      ? { href: facebookUrl, label: "Facebook", Icon: FacebookIcon }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: typeof LinkedInIcon;
  }[];

  if (links.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
            tone === "dark"
              ? "border-white/20 bg-white/10 text-white hover:border-[#7eb8a4]/50 hover:bg-[#7eb8a4]/15 hover:text-[#7eb8a4]"
              : "border-line bg-white text-ink hover:border-[#0e1f1c]/25 hover:bg-[#f7f8fa]",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );
}
