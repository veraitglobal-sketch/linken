import { NetworkMark } from "@/components/marketing/network-mark";

type Props = {
  label: string;
  price: string;
  features: readonly string[];
};

/** Left-rail Pro story — calm brand plane before checkout. */
export function BillingProAside({ label, price, features }: Props) {
  return (
    <aside className="billing-pro-aside relative flex min-h-[420px] flex-col overflow-hidden rounded-[28px] bg-navy px-7 py-8 text-white lg:min-h-full lg:rounded-[32px] lg:px-9 lg:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 12% 18%, rgba(126,184,164,0.22), transparent 58%), radial-gradient(ellipse 70% 50% at 88% 92%, rgba(184,137,90,0.12), transparent 55%)",
        }}
      />
      <div className="stage-grain pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 flex items-center gap-2.5 text-white/45">
        <NetworkMark size={16} animate={false} className="text-blue-soft" />
        <p className="text-[12px] font-medium tracking-[-0.01em]">Hansala</p>
      </div>

      <div className="relative z-10 mt-10 flex flex-1 flex-col justify-center">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-blue-soft/90 uppercase">
          {label}
        </p>
        <p className="mt-3 font-display text-[clamp(2.4rem,4vw,3.25rem)] leading-none font-medium tracking-[-0.045em]">
          {price}
        </p>
        <p className="mt-4 max-w-[16rem] text-[14px] leading-relaxed text-white/55">
          Unlock premium embeds, analytics, and the tools your network already
          expects.
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex gap-3 text-[13px] leading-snug text-white/78"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-soft"
                aria-hidden
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 mt-10 text-[11px] tracking-[-0.01em] text-white/35">
        Secure checkout · Cancel anytime
      </p>
    </aside>
  );
}
