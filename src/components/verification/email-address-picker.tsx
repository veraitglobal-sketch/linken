"use client";

import { useState } from "react";
import type { DiscoveredEmail } from "@/features/verification/email-discovery";
import { cn } from "@/lib/cn";

type Props = {
  addresses: DiscoveredEmail[];
  picked: string;
  onPick: (email: string) => void;
};

export function EmailAddressPicker({ addresses, picked, onPick }: Props) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-2">
      <p className="text-[12px] font-semibold text-ink">
        Addresses found on your site
      </p>
      <ul className="space-y-1.5">
        {addresses.map((item) => {
          const hidden = item.personal && !revealed[item.email];
          const label = hidden
            ? maskEmail(item.email)
            : item.email;
          return (
            <li key={item.email}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                  picked === item.email
                    ? "border-navy/40 bg-navy/5"
                    : "border-line bg-paper/40 hover:bg-paper/70",
                )}
              >
                <input
                  type="radio"
                  name="email_pick"
                  checked={picked === item.email}
                  onChange={() => onPick(item.email)}
                  className="accent-navy"
                />
                <span className="min-w-0 flex-1 font-mono text-[12px] text-ink">
                  {label}
                </span>
                {item.personal ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setRevealed((prev) => ({
                        ...prev,
                        [item.email]: !prev[item.email],
                      }));
                    }}
                    className="shrink-0 text-[11px] font-semibold text-plus hover:text-ink"
                  >
                    {hidden ? "Show" : "Hide"}
                  </button>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "••••@••••";
  const head = local.slice(0, 1);
  return `${head}•••@${domain}`;
}
