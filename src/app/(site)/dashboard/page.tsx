import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "Dashboard",
};

const items = [
  {
    href: "/c/acme-architecture",
    title: "Public profile",
    body: "Preview how visitors see your company and partners.",
  },
  {
    href: "/dashboard/partners",
    title: "Partner requests",
    body: "Search companies and send mutual partnership invites.",
  },
  {
    href: "/onboarding",
    title: "Company setup",
    body: "Create or update the company owned by your account.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Owner"
        title="Company dashboard"
        description="One owner per company. Manage the public profile and verified partners."
      />
      <div className="mt-8 flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-ink/20"
          >
            <h2 className="text-sm font-medium text-ink">{item.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{item.body}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Button href="/search" variant="secondary">
          Open company search
        </Button>
      </div>
    </div>
  );
}
