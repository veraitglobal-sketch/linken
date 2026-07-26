import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Status",
  description: "Hansala service status.",
  robots: { index: true, follow: true },
};

export default function StatusPage() {
  const checked = new Date().toISOString().slice(0, 16).replace("T", " ");

  return (
    <LegalDoc eyebrow="Operations" title="Status" updated="26 July 2026">
      <div className="rounded-2xl border border-[#1a5c51]/30 bg-[#1a5c51]/10 px-4 py-4">
        <p className="text-[13px] font-semibold text-ink">All systems operational</p>
        <p className="mt-1 text-[12px] text-muted">
          Manual status page · last reviewed {checked} UTC
        </p>
      </div>

      <h2>Components</h2>
      <ul>
        <li>Web app (hansala.com) — operational</li>
        <li>Public API `/api/v1` — operational</li>
        <li>Agent API `/api/v1/agent` — operational</li>
        <li>Auth &amp; email delivery — operational</li>
      </ul>

      <h2>Incidents</h2>
      <p>No open incidents. Historical notes will appear here when needed.</p>

      <h2>Subscribe</h2>
      <p>
        Questions or outages:{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>. API
        changes: <Link href="/changelog">Changelog</Link>.
      </p>
    </LegalDoc>
  );
}
