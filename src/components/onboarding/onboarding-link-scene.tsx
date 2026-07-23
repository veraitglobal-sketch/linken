import { COMPANY_SHARE_PREFIX } from "@/lib/site";

/** Closing composition for create-profile — editorial, not a flow diagram. */
export function OnboardingLinkScene() {
  return (
    <div className="border-t border-white/15 pt-6">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
        Public address
      </p>
      <p className="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] leading-none tracking-[-0.035em] text-white">
        {COMPANY_SHARE_PREFIX}/
        <span className="text-white/40">your-company</span>
      </p>
      <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
        The page you share with clients. Partners join it only when both firms
        confirm.
      </p>
    </div>
  );
}
