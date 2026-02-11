import type { NextRequest } from "next/server";
import { createOgImageResponse } from "@/app/api/og/route";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return createOgImageResponse(request, "About Reway");
}
