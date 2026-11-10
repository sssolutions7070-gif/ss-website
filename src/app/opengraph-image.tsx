import { ImageResponse } from "next/og";

export const alt =
  "SS Solutions — Digital Products, Software & Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px",
          background:
            "radial-gradient(900px 520px at 78% 12%, #191038 0%, #060607 62%)",
          color: "#f6f6f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 26,
              height: 26,
              transform: "rotate(45deg)",
              border: "4px solid #7c5cff",
              borderRadius: 6,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            SS Solutions
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            We build digital products that move businesses forward.
          </div>
          <div style={{ fontSize: 25, color: "#9b9ba3", letterSpacing: 1 }}>
            Web · Mobile · Software · Automation · Marketing
          </div>
        </div>
      </div>
    ),
    size,
  );
}
