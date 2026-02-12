"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fetchMetadata, normalizeUrl } from "@/lib/metadata";

export async function checkDuplicateBookmarks(urls: string[]): Promise<{
  duplicates: Record<string, { id: string; title: string; url: string }>;
}> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const normalizedUrls = urls.map((url) => normalizeUrl(url));

  const { data } = await supabase
    .from("bookmarks")
    .select("id, title, url, normalized_url")
    .eq("user_id", userData.user.id)
    .in("normalized_url", normalizedUrls);

  const duplicates: Record<string, { id: string; title: string; url: string }> =
    {};
  if (data) {
    for (const bookmark of data) {
      if (bookmark.normalized_url) {
        duplicates[bookmark.normalized_url] = {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
        };
      }
    }
  }

  return { duplicates };
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
      url: formData.url,
      normalized_url: normalizedUrl,
      title: title,
      favicon_url: formData.favicon_url,
      og_image_url: formData.og_image_url,
      image_url: formData.og_image_url,
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

  revalidatePath("/dashboard");
  return data.id;
}

export async function enrichCreatedBookmark(id: string, url: string) {
  try {
    const metadata = await fetchMetadata(url);
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

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
      .eq("id", id)
      .eq("user_id", userData.user.id);

    revalidatePath("/dashboard");
    return {
      status: "ready" as const,
      title: metadata.title,
      description: metadata.description,
      favicon_url: metadata.favicon,
      og_image_url: metadata.ogImage,
      image_url: metadata.ogImage,
      last_fetched_at: new Date().toISOString(),
      error_reason: null,
    };
  } catch (error) {
    console.error("Enrichment failed for", url, error);
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }
    await supabase
      .from("bookmarks")
      .update({
        status: "failed",
        error_reason: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", id)
      .eq("user_id", userData.user.id);
    revalidatePath("/dashboard");
    return {
      status: "failed" as const,
      error_reason: error instanceof Error ? error.message : "Unknown error",
    };
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

  const updatePromises = updates.map((update) =>
    supabase
      .from("bookmarks")
      .update({ order_index: update.order_index })
      .eq("id", update.id)
      .eq("user_id", userData.user.id),
  );

  const results = await Promise.all(updatePromises);

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    console.error("Error updating order:", firstError);
    throw new Error(`Failed to update order: ${firstError.message}`);
  }

  revalidatePath("/dashboard");
}

export async function deleteBookmarks(ids: string[]) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  if (uniqueIds.length === 0) return;

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .in("id", uniqueIds)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting bookmarks:", error);
    throw new Error("Failed to delete bookmarks");
  }

  revalidatePath("/dashboard");
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

  const { error } = await supabase.from("bookmarks").upsert(
    {
      id: bookmark.id,
      url: bookmark.url,
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

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

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

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bookmarks")
    .update({
      ...metadata,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error enriching bookmark:", error);
    return;
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
    favicon_url?: string | null;
    apply_favicon_to_domain?: boolean;
  },
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const normalizedUrl = normalizeUrl(formData.url);

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: formData.title,
      url: formData.url,
      normalized_url: normalizedUrl,
      description: formData.description,
      group_id: formData.group_id,
      favicon_url: formData.favicon_url,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating bookmark:", error);
    throw new Error("Failed to update bookmark");
  }

  if (formData.apply_favicon_to_domain) {
    const targetDomain = (() => {
      try {
        return new URL(formData.url).hostname.replace("www.", "");
      } catch {
        return null;
      }
    })();

    if (targetDomain) {
      const { data: userBookmarks, error: fetchError } = await supabase
        .from("bookmarks")
        .select("id, url")
        .eq("user_id", userData.user.id);

      if (fetchError) {
        console.error(
          "Error fetching bookmarks for domain update:",
          fetchError,
        );
        throw new Error("Failed to update domain bookmarks");
      }

      const matchingIds = (userBookmarks ?? [])
        .filter((bookmark) => {
          try {
            const bookmarkDomain = new URL(bookmark.url).hostname.replace(
              "www.",
              "",
            );
            return bookmarkDomain === targetDomain;
          } catch {
            return false;
          }
        })
        .map((bookmark) => bookmark.id);

      if (matchingIds.length > 0) {
        const { error: domainUpdateError } = await supabase
          .from("bookmarks")
          .update({ favicon_url: formData.favicon_url ?? null })
          .eq("user_id", userData.user.id)
          .in("id", matchingIds);

        if (domainUpdateError) {
          console.error("Error updating domain favicon:", domainUpdateError);
          throw new Error("Failed to update domain favicon");
        }
      }
    }
  }

  revalidatePath("/dashboard");
}
