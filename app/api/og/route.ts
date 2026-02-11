import React from "react";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function clamp(input: string, max: number) {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

export async function createOgImageResponse(
  request: NextRequest,
  rawTitle: string,
) {
  const title = clamp(rawTitle, 64);
  const origin = new URL(request.url).origin;

  let geistVariable: ArrayBuffer | null = null;

  try {
    geistVariable = await fetch(`${origin}/fonts/Geist%5Bwght%5D.ttf`).then(
      (res) => res.arrayBuffer(),
    );
  } catch {
    geistVariable = null;
  }

  const fonts = geistVariable
    ? [
        {
          name: "Geist",
          data: geistVariable,
          style: "normal" as const,
          weight: 400 as const,
        },
      ]
    : undefined;

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#FFFFFF",
          color: "#111111",
          fontFamily:
            "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "18px" } },
        React.createElement(
          "div",
          { style: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" } },
          "Reway",
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            },
          },
          React.createElement(
            "span",
            { style: { color: "#111111" } },
            title,
          ),
        ),
      ),
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title") ?? "Reway";
  return createOgImageResponse(request, rawTitle);
}
