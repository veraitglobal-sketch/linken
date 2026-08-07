import Link from "next/link";
import { cookies } from "next/headers";
import { setAnalyticsConsent } from "@/features/product-analytics/consent-actions";
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_VENDOR_COOKIE,
  parseFirstPartyConsent,
  parseVendorConsent,
} from "@/features/product-analytics/consent";

/** Opt-out / vendor opt-in controls — no third-party SDK. */
export async function AnalyticsConsentForm() {
  const jar = await cookies();
  const firstParty = parseFirstPartyConsent(
    jar.get(ANALYTICS_CONSENT_COOKIE)?.value,
  );
  const vendors = parseVendorConsent(jar.get(ANALYTICS_VENDOR_COOKIE)?.value);

  return (
    <form
      action={setAnalyticsConsent}
      className="mt-4 space-y-4 rounded-2xl border border-line bg-surface px-5 py-5"
    >
      <p className="text-[13px] leading-relaxed text-ink-soft">
        First-party product analytics is on by default (legitimate interest —
        see{" "}
        <Link href="/privacy" className="font-medium text-ink underline-offset-2 hover:underline">
          Privacy
        </Link>
        ). You can opt out of visitor beacons. Third-party analytics vendors are
        off unless you opt in and an operator configures a provider.
      </p>
      <fieldset className="space-y-2">
        <legend className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
          First-party product analytics
        </legend>
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input
            type="radio"
            name="first_party"
            value="allow"
            defaultChecked={firstParty === "allow"}
          />
          Allow
        </label>
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input
            type="radio"
            name="first_party"
            value="deny"
            defaultChecked={firstParty === "deny"}
          />
          Opt out of visitor analytics
        </label>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
          Optional third-party analytics
        </legend>
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input
            type="radio"
            name="vendors"
            value="deny"
            defaultChecked={vendors === "deny"}
          />
          Off (default)
        </label>
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input
            type="radio"
            name="vendors"
            value="allow"
            defaultChecked={vendors === "allow"}
          />
          Allow if configured
        </label>
      </fieldset>
      <button
        type="submit"
        className="rounded-full bg-navy px-5 py-2 text-[13px] font-semibold text-white"
      >
        Save preferences
      </button>
    </form>
  );
}
