"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { google } from "@/lib/ai";
import { generateText } from "ai";
import { fetchMetadata, normalizeUrl } from "@/lib/metadata";
import {
  decryptToken,
  encryptToken,
  generatePlainToken,
  getTokenPrefix,
  hashToken,
} from "@/lib/tokens";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function extractLinks(content: string, isImage = false) {
  try {
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

    console.log("AI Raw Response:", text); // Debug log

    // Clean up potential markdown formatting if AI ignores system instructions
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const urls = JSON.parse(cleanText);
    console.log("Extracted URLs:", urls); // Debug log
    return Array.isArray(urls) ? urls : [];
  } catch (error) {
    console.error("Link extraction failed:", error);
    return [];
  }
}

export async function addBookmark(formData: {
  url: string;
  id?: string;
  title?: string;
  favicon_url?: string;
  og_image_url?: string;
  description?: string;
  group_id?: string;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  // Get current min order_index to prepend
  const { data: minOrderData } = await supabase
    .from("bookmarks")
    .select("order_index")
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  const nextOrderIndex = minOrderData ? (minOrderData.order_index ?? 0) - 1 : 0;

  const normalizedUrl = normalizeUrl(formData.url);
  const title = formData.title || normalizedUrl;

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      id: formData.id,
      url: normalizedUrl,
      normalized_url: normalizedUrl,
      title: title,
      favicon_url: formData.favicon_url,
      og_image_url: formData.og_image_url,
      image_url: formData.og_image_url, // initial guess
      description: formData.description,
      group_id: formData.group_id,
      user_id: userData.user.id,
      status: "pending",
      order_index: nextOrderIndex,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error adding bookmark:", error);
    throw new Error("Failed to add bookmark");
  }

  // No longer triggering background enrichment here to avoid unawaited promise issues
  // processBookmarkMetadata(data.id, normalizedUrl);

  revalidatePath("/dashboard");
  return data.id;
}

export async function enrichCreatedBookmark(id: string, url: string) {
  try {
    const metadata = await fetchMetadata(url);
    const supabase = await createClient();

    await supabase
      .from("bookmarks")
      .update({
        title: metadata.title,
        description: metadata.description,
        favicon_url: metadata.favicon,
        og_image_url: metadata.ogImage,
        image_url: metadata.ogImage,
        status: "ready",
        last_fetched_at: new Date().toISOString(),
      })
      .eq("id", id);

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Enrichment failed for", url, error);
    const supabase = await createClient();
    await supabase
      .from("bookmarks")
      .update({
        status: "failed",
        error_reason: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", id);
    revalidatePath("/dashboard");
  }
}

export async function updateBookmarksOrder(
  updates: { id: string; order_index: number }[],
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  // Use individual updates to avoid satisfying NOT NULL constraints on other columns (like URL)
  // for an upsert/insert operation.
  const updatePromises = updates.map(
    (update) =>
      supabase
        .from("bookmarks")
        .update({ order_index: update.order_index })
        .eq("id", update.id)
        .eq("user_id", userData.user.id), // Security check
  );

  const results = await Promise.all(updatePromises);

  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    console.error("Error updating order:", firstError);
    throw new Error(`Failed to update order: ${firstError.message}`);
  }

  revalidatePath("/dashboard");
}

export async function updateFolderBookmarksOrder(
  updates: { id: string; folder_order_index: number }[],
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const updatePromises = updates.map((update) =>
    supabase
      .from("bookmarks")
      .update({ folder_order_index: update.folder_order_index })
      .eq("id", update.id)
      .eq("user_id", userData.user.id),
  );

  const results = await Promise.all(updatePromises);

  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    console.error("Error updating folder order:", firstError);
    throw new Error(`Failed to update folder order: ${firstError.message}`);
  }

  revalidatePath("/dashboard");
}

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

export async function restoreBookmark(bookmark: {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  group_id?: string | null;
  favicon_url?: string | null;
  og_image_url?: string | null;
  image_url?: string | null;
  order_index?: number | null;
  created_at?: string | null;
  status?: string | null;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const normalizedUrl = normalizeUrl(bookmark.url);

  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      {
        id: bookmark.id,
        url: normalizedUrl,
        normalized_url: normalizedUrl,
        title: bookmark.title,
        description: bookmark.description ?? null,
        group_id: bookmark.group_id ?? null,
        favicon_url: bookmark.favicon_url ?? null,
        og_image_url: bookmark.og_image_url ?? null,
        image_url: bookmark.image_url ?? null,
        order_index: bookmark.order_index ?? null,
        created_at: bookmark.created_at ?? new Date().toISOString(),
        status: bookmark.status ?? "ready",
        user_id: userData.user.id,
      },
      { onConflict: "id" },
    );

  if (error) {
    console.error("Error restoring bookmark:", error);
    throw new Error("Failed to restore bookmark");
  }

  revalidatePath("/dashboard");
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("bookmarks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting bookmark:", error);
    throw new Error("Failed to delete bookmark");
  }

  revalidatePath("/dashboard");
}

export async function enrichBookmark(
  id: string,
  metadata: {
    title?: string;
    favicon_url?: string;
    og_image_url?: string;
    description?: string;
    image_url?: string;
    status?: "pending" | "ready" | "failed";
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookmarks")
    .update({
      ...metadata,
    })
    .eq("id", id);

  if (error) {
    console.error("Error enriching bookmark:", error);
    return;
  }

  revalidatePath("/dashboard");
}

export async function createGroup(formData: {
  name: string;
  icon: string;
  color?: string | null;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: formData.name,
      icon: formData.icon,
      color: formData.color ?? null,
      user_id: userData.user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }

  revalidatePath("/dashboard");
  return data.id;
}

export async function updateGroup(
  id: string,
  formData: { name: string; icon: string; color?: string | null },
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("groups")
    .update({
      name: formData.name,
      icon: formData.icon,
      color: formData.color ?? null,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating group:", error);
    throw new Error("Failed to update group");
  }

  revalidatePath("/dashboard");
}

export async function deleteGroup(id: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }

  revalidatePath("/dashboard");
}

export async function updateBookmark(
  id: string,
  formData: {
    title: string;
    url: string;
    description?: string;
    group_id?: string | null;
  },
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: formData.title,
      url: formData.url,
      description: formData.description,
      group_id: formData.group_id,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating bookmark:", error);
    throw new Error("Failed to update bookmark");
  }

  revalidatePath("/dashboard");
}
