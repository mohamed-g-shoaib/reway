import React from "react";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function clamp(input: string, max: number) {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.length > max
    ? `${normalized.slice(0, max - 1)}…`
    : normalized;
}

/**
 * Creates a branded OG image response.
 * Matches the website's dark aesthetic and premium feel.
 */
export async function createOgImageResponse(
  request: NextRequest,
  rawTitle: string,
) {
  const title = clamp(rawTitle, 64);
  const origin = new URL(request.url).origin;

  let fontData: ArrayBuffer | null = null;
  try {
    // Attempt to fetch the brand font from the local public directory
    const fontUrl = new URL("/fonts/Geist.ttf", origin);
    const res = await fetch(fontUrl);
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.warn(
        `OG: Failed to fetch font from ${fontUrl}`,
        res.status,
        res.statusText,
      );
    }
  } catch (e) {
    console.error("OG: Failed to load font:", e);
    fontData = null;
  }

  try {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080808",
          // Subtle radial gradient for depth
          backgroundImage:
            "radial-gradient(circle at center, #111111 0%, #080808 100%)",
          color: "#FAFAFA",
          padding: "80px",
          fontFamily: fontData ? "Geist" : "sans-serif",
        }}
      >
        {/* Decorative Top Border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
          }}
        />

        {/* Logo Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#080808"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#FAFAFA",
              letterSpacing: "-0.04em",
            }}
          >
            Reway
          </div>
        </div>

        {/* Content Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "1100px",
          }}
        >
          <div
            style={{
              fontSize: "92px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              marginBottom: "40px",
              color: "#FFFFFF",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div
              style={{
                fontSize: "28px",
                color: "#A1A1AA",
                fontWeight: 500,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              A Calm Home For Everything You Save
            </div>
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
          </div>
        </div>

        {/* Decorative Bottom Line (Stone Theme) */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "1px",
            background: "#222222",
          }}
        />
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [
              {
                name: "Geist",
                data: fontData,
                style: "normal",
                weight: 800,
              },
            ]
          : undefined,
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("OG: Failed to generate image:", error);
    return new Response(`Failed to generate OG image: ${error.message}`, {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title") ?? "Reway";
  return createOgImageResponse(request, rawTitle);
}
