"use server";

import { createClient } from "@/lib/supabase/server";
import {
  decryptToken,
  encryptToken,
  generatePlainToken,
  getTokenPrefix,
  hashToken,
} from "@/lib/tokens";

export async function listApiTokens() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("api_tokens")
    .select("id, name, token_prefix, created_at, last_used_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching api tokens:", error);
    throw new Error("Failed to fetch tokens");
  }

  return data ?? [];
}

export async function createApiToken(name: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const plainToken = generatePlainToken();
  const tokenHash = hashToken(plainToken);
  const tokenPrefix = getTokenPrefix(plainToken);
  const encrypted = encryptToken(plainToken);

  const { data, error } = await supabase
    .from("api_tokens")
    .insert({
      name,
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
      token_encrypted: encrypted.encrypted,
      token_iv: encrypted.iv,
      token_tag: encrypted.tag,
      user_id: userData.user.id,
    })
    .select("id, name, token_prefix, created_at")
    .single();

  if (error) {
    console.error("Error creating api token:", error);
    throw new Error("Failed to create token");
  }

  return {
    token: plainToken,
    ...data,
  };
}

export async function revealApiToken(id: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("api_tokens")
    .select("token_encrypted, token_iv, token_tag")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (error || !data) {
    console.error("Error revealing api token:", error);
    throw new Error("Failed to reveal token");
  }

  return decryptToken({
    encrypted: data.token_encrypted,
    iv: data.token_iv,
    tag: data.token_tag,
  });
}

export async function deleteApiToken(id: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("api_tokens")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting api token:", error);
    throw new Error("Failed to delete token");
  }
}
