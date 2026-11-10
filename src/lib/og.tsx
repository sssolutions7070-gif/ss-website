import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared branded social-share card for case studies and articles. */
export function ogCard({ kicker, title, subtitle, accent = "#7c5cff" }: { kicker: string; title: string; subtitle?: string; accent?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: `radial-gradient(900px 560px at 82% 8%, ${accent}55 0%, #0b0920 58%, #060607 100%)`,
          color: "#f6f6f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 26, height: 26, transform: "rotate(45deg)", border: "4px solid #7c5cff", borderRadius: 6 }} />
          <div style={{ fontSize: 28, fontWeight: 600 }}>SS Solutions</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: accent }}>{kicker}</div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 26, color: "#a5a5b0", maxWidth: 980, lineHeight: 1.35 }}>{subtitle}</div>}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
