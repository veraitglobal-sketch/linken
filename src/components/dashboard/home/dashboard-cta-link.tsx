"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackDashboardCta } from "@/features/dashboard/track-cta";

type Props = {
  companyId: string;
  ctaId: string;
  href: string;
  children: ReactNode;
  className?: string;
};

/** Wraps a CTA — logs click then navigates (no PII). */
export function DashboardCtaLink({
  companyId,
  ctaId,
  href,
  children,
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        void trackDashboardCta(companyId, ctaId);
      }}
    >
      {children}
    </Link>
  );
}
