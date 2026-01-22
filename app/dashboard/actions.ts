"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { google } from "@/lib/ai";
import { generateText } from "ai";

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
  title?: string;
  favicon_url?: string;
  description?: string;
  group_id?: string;
  is_enriching?: boolean;
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

  // Use the URL as title if none provided (instant mode)
  const title = formData.title || formData.url;

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      url: formData.url,
      title: title,
      favicon_url: formData.favicon_url,
      description: formData.description,
      group_id: formData.group_id,
      user_id: userData.user.id,
      is_enriching: formData.is_enriching ?? false,
      order_index: nextOrderIndex,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error adding bookmark:", error);
    throw new Error("Failed to add bookmark");
  }

  revalidatePath("/dashboard");
  return data.id;
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
    description?: string;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookmarks")
    .update({
      ...metadata,
      is_enriching: false,
    })
    .eq("id", id);

  if (error) {
    console.error("Error enriching bookmark:", error);
    return;
  }

  revalidatePath("/dashboard");
}

export async function createGroup(formData: { name: string; icon: string }) {
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
  formData: { name: string; icon: string },
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
