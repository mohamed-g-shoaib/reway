import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f7f7f5",
          color: "#0b0b0a",
          padding: "72px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background:
              "radial-gradient(circle at 20% 20%, rgba(15, 15, 12, 0.08), transparent 55%), radial-gradient(circle at 80% 10%, rgba(15, 15, 12, 0.06), transparent 50%), radial-gradient(circle at 70% 80%, rgba(15, 15, 12, 0.08), transparent 60%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 900,
            marginTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            Reway
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            A calm home for everything you save.
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 26,
              color: "#45433d",
              fontWeight: 500,
            }}
          >
            AI link extraction, groups, keyboard navigation, and flexible views.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 40,
          }}
        >
          {["AI Extraction", "Groups", "Keyboard", "View Modes"].map((item) => (
            <div
              key={item}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(15, 15, 12, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                fontSize: 20,
                fontWeight: 600,
                color: "#1a1916",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#2f2e29",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <div>reway.vercel.app</div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              backgroundColor: "#11110f",
              color: "#f7f7f5",
              fontSize: 18,
            }}
          >
            Save everything, calmly
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
