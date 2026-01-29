import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/tokens";

export interface ExtensionAuthResult {
  userId: string;
  tokenId: string;
}

export async function requireExtensionAuth(): Promise<ExtensionAuthResult> {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  console.log(
    "[Extension Auth] Auth header:",
    authHeader ? "present" : "missing",
  );

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[Extension Auth] Invalid auth header format");
    throw new Error("Missing authorization");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    console.error("[Extension Auth] Empty token after Bearer");
    throw new Error("Missing token");
  }

  console.log("[Extension Auth] Token prefix:", token.slice(0, 6));
  const tokenHash = hashToken(token);
  console.log("[Extension Auth] Token hash:", tokenHash.slice(0, 16) + "...");

  const { data, error } = await supabaseAdmin
    .from("api_tokens")
    .select("id, user_id, token_hash")
    .eq("token_hash", tokenHash)
    .single();

  if (error || !data) {
    console.error(
      "[Extension Auth] Token lookup failed:",
      error?.message || "No data",
    );
    console.error("[Extension Auth] Looking for hash:", tokenHash);

    // Debug: Check if any tokens exist
    const { data: allTokens } = await supabaseAdmin
      .from("api_tokens")
      .select("id, token_prefix, token_hash")
      .limit(5);
    console.log(
      "[Extension Auth] Available token prefixes:",
      allTokens?.map((t) => t.token_prefix),
    );

    throw new Error("Invalid token");
  }

  console.log(
    "[Extension Auth] Token validated successfully for user:",
    data.user_id,
  );

  await supabaseAdmin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { userId: data.user_id, tokenId: data.id };
}
