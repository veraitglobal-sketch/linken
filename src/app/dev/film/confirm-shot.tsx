"use client";

import { useState } from "react";
import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";
import type { ClientConfirmationView } from "@/types/client-confirmation";
import type { PublicTestimonial } from "@/features/testimonials/types";

/**
 * Shot 01 — the confirm.
 *
 * The first pass drew a card that stood in for the product. That was the
 * mistake: it read as a diagram of the idea rather than as the thing itself,
 * and "real" was the whole brief. Everything in frame here is the shipped
 * component — `ConfirmDecision` is literally the panel a client opens from the
 * email, and the payoff is `EmbedTestimonialCard`, the same card a customer's
 * own site renders.
 *
 * Motion lives in the page, not in an editor: the timing is a number to change
 * and re-record in one take, identical every time.
 *
 * Built at 1280×720 CSS. A retina capture of that rectangle is a 2560×1440
 * master, which is why it is not built at 2560.
 *
 * `prefers-reduced-motion` is deliberately ignored — this is a film set, and
 * the route 404s in production.
 */

/* ONE FIELD IS NOT MINE TO KNOW: `caseYear`. Set it to the true year before
   filming. Everything else is Vera IT's actual relationship with Fade, and the
   logo already ships in `public/logos/showcase/fade.png`. */
const VIEW: ClientConfirmationView = {
  id: "film",
  caseStudyId: "film",
  requestedByCompanyId: "vera",
  email: "",
  token: "film-set-no-submit",
  status: "pending",
  confirmedByCompanyId: null,
  createdAt: "",
  confirmedAt: null,
  caseTitle: "Fade",
  caseSlug: "fade",
  caseSummary: "Mobile booking app for barbers, built and shipped worldwide.",
  caseYear: "2025",
  caseLocation: "",
  requesterName: "Vera IT",
  requesterSlug: "verait",
  confirmerName: "Fade",
  confirmerSlug: "fade",
  confirmerLogoUrl: "/logos/showcase/fade.png",
};

const RECORD: PublicTestimonial = {
  id: "film-record",
  body: "Vera built and shipped our booking app worldwide. Clear ownership from the first call to production.",
  authorName: "Fade",
  authorRole: "Founder",
  authorCompany: { name: "Fade", slug: "fade", logoUrl: "/logos/showcase/fade.png" },
  source: "case_study",
  publishedAt: "",
  profileUrl: "/c/verait",
  provenanceLine: "Confirmed by the client · getfadeapp.com · domain verified",
};

const T = {
  cursorTravel: 900,
  pause: 2100,
  click: 2600,
  panelOut: 2900,
  recordIn: 3500,
  evidence: 4200,
  end: 6400,
} as const;

export function ConfirmShot() {
  const [take, setTake] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTake((t) => t + 1)}
          className="h-9 rounded-full bg-navy px-4 text-[12px] font-semibold text-on-navy"
        >
          Replay take
        </button>
        <p className="text-[12px] text-muted">
          1280×720 CSS · record at 2× → 2560×1440 · {T.end / 1000}s
        </p>
      </div>

      <div
        key={take}
        className="relative overflow-hidden bg-[#f4f6f4]"
        style={{ width: 1280, height: 720 }}
      >
        <style>{CSS}</style>

        {/* Nothing in the set is clickable. `ConfirmDecision` carries real
            server actions, and a stray click would fire one with a dead token. */}
        <div className="shot-plate pointer-events-none absolute inset-0 grid place-items-center">
          <div className="relative" style={{ width: 520 }}>
            <div className="shot-panel">
              <ConfirmDecision view={VIEW} companyName="Fade" />
            </div>

            <div className="shot-record absolute inset-x-0 top-0">
              <div className="rounded-[20px] border border-[rgba(13,18,16,0.08)] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(8,20,18,0.35)]">
                <div className="shot-lockup">
                  <EmbedVerifiedLockup theme="light" size="md" subtitle="Verified" />
                </div>
                <div className="shot-card mt-5">
                  <EmbedTestimonialThemeShell theme={PRESET_TOKENS.card}>
                    <EmbedTestimonialCard
                      item={RECORD}
                      profileUrl="/c/verait"
                      quiet
                    />
                  </EmbedTestimonialThemeShell>
                </div>
              </div>
            </div>

            <span aria-hidden className="shot-cursor absolute h-5 w-5">
              <svg viewBox="0 0 20 20" className="h-5 w-5 drop-shadow-[0_2px_6px_rgba(8,20,18,0.4)]">
                <path d="M3 2l12 7-5 1.6L8.4 16 3 2z" fill="#0d1210" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.shot-plate { animation: shot-push 6400ms cubic-bezier(.22,.61,.36,1) both; }
@keyframes shot-push {
  0%   { transform: perspective(1800px) rotateX(2deg) scale(1.012); }
  100% { transform: perspective(1800px) rotateX(0deg) scale(1); }
}

/* Measured, not guessed: the real "Confirm project" button centres at
   top 369 / left 256 inside the 520px stack. The arrow tip sits ~3px in from
   the box origin, so the box lands 3px up and left of that — the point of the
   cursor has to touch the button, not the box corner. */
.shot-cursor {
  animation: shot-cursor-move ${T.cursorTravel}ms cubic-bezier(.22,.61,.36,1) both,
             shot-cursor-press 260ms ease-in-out ${T.click}ms both;
}
@keyframes shot-cursor-move {
  from { top: 520px; left: 470px; opacity: 0; }
  to   { top: 366px; left: 253px; opacity: 1; }
}
@keyframes shot-cursor-press {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(.86); }
}

.shot-panel { animation: shot-panel-out 700ms cubic-bezier(.4,0,.2,1) ${T.panelOut}ms both; }
@keyframes shot-panel-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-10px) scale(.985); }
}

.shot-record { opacity: 0; animation: shot-record-in 750ms cubic-bezier(.4,0,.2,1) ${T.recordIn}ms both; }
@keyframes shot-record-in {
  from { opacity: 0; transform: translateY(16px) scale(.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.shot-card { animation: shot-rise 620ms cubic-bezier(.22,.61,.36,1) ${T.evidence}ms both; }
@keyframes shot-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
