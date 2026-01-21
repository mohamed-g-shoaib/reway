"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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
