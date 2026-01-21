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
  title: string;
  favicon_url?: string;
  description?: string;
  group_id?: string;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("bookmarks").insert({
    url: formData.url,
    title: formData.title,
    favicon_url: formData.favicon_url,
    description: formData.description,
    group_id: formData.group_id,
    user_id: userData.user.id,
  });

  if (error) {
    console.error("Error adding bookmark:", error);
    throw new Error("Failed to add bookmark");
  }

  revalidatePath("/dashboard");
}
