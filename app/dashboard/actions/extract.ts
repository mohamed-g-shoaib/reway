"use server";

import { google } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";

class RateLimitError extends Error {
  override name = "RateLimitError";
}

function getDailyLimitForUser() {
  const raw = process.env.AI_RPD_LIMIT;
  const parsed = raw ? Number(raw) : 10;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function getGlobalActionBucket() {
  return "ai_any";
}

async function enforceDailyLimit(action: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new RateLimitError("Authentication required");
  }

  const limit = getDailyLimitForUser();

  const { data, error } = await supabase.rpc("enforce_ai_daily_limit", {
    action_name: action,
    daily_limit: limit,
  });

  if (error) {
    throw new RateLimitError(error.message);
  }

  return { limit, used: typeof data === "number" ? data : 0 };
}

export async function getAiDailyUsage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const action = getGlobalActionBucket();
  const limit = getDailyLimitForUser();

  const { data, error } = await supabase
    .from("ai_daily_usage")
    .select("used")
    .eq("user_id", user.id)
    .eq("action", action)
    .eq("day", new Date().toISOString().slice(0, 10))
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return { used: data?.used ?? 0, limit };
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export async function extractLinks(content: string, isImage = false) {
  try {
    if (!isImage) {
      return [];
    }

    await enforceDailyLimit(getGlobalActionBucket());

    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      messages: [
        {
          role: "system",
          content:
            "Extract all URLs from the provided content. Return ONLY a valid JSON array of strings (the URLs). If no URLs are found, return []. Do not include any other text or markdown formatting.",
        },
        {
          role: "user",
          content: isImage
            ? [
                {
                  type: "image",
                  image: new Uint8Array(Buffer.from(content, "base64")),
                },
              ]
            : content,
        },
      ],
    });

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const urls = JSON.parse(cleanText);
    return isStringArray(urls) ? urls : [];
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    console.error("Link extraction failed:", error);
    throw error;
  }
}
