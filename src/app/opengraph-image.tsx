import { ImageResponse } from "next/og";

export const alt = "Hansala — mutual confirmation of work between companies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#cdef84";
const NAVY = "#0e1f1c";

/** The mark: two nodes and the link between them. */
function Mark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <line x1="14" y1="24" x2="34" y2="24" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12" cy="24" r="5.5" fill={color} />
      <circle cx="36" cy="24" r="5.5" fill={color} />
    </svg>
  );
}

/**
 * Site-wide share card — what WhatsApp, Viber, Slack, LinkedIn and iMessage
 * show for a hansala.com link. Without it they pick an arbitrary image off the
 * page. No company, name or number: brand, the rule, the address.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: LIME,
          color: NAVY,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: NAVY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mark size={60} color={LIME} />
            </div>
            <span style={{ fontSize: 46, letterSpacing: "-0.03em" }}>Hansala</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: 12,
                background: NAVY,
                color: LIME,
                borderRadius: 999,
                padding: "12px 24px",
                fontSize: 26,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16">
                <path d="m3.5 8.5 3 3 6-7" stroke={LIME} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mutual confirmation
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 76,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                maxWidth: 700,
              }}
            >
              Work records confirmed by both companies.
            </div>
          </div>

          <span style={{ fontSize: 30, letterSpacing: "-0.01em", opacity: 0.75 }}>hansala.com</span>
        </div>

        {/* Two companies and the confirmed link between them. */}
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 150,
            width: 330,
            height: 330,
            borderRadius: 48,
            background: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: 999, background: "#ffffff" }} />
            <div style={{ width: 34, height: 6, background: LIME }} />
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                background: LIME,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 16 16">
                <path d="m3.5 8.5 3 3 6-7" stroke={NAVY} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ width: 34, height: 6, background: LIME }} />
            <div style={{ width: 68, height: 68, borderRadius: 999, background: "#ffffff" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
