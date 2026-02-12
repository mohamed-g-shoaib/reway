"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNote(formData: {
  text: string;
  color?: string | null;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { data: minOrderData } = await supabase
    .from("notes")
    .select("order_index")
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  const nextOrderIndex = minOrderData ? (minOrderData.order_index ?? 0) - 1 : 0;

  const { data, error } = await supabase
    .from("notes")
    .insert({
      text: formData.text,
      color: formData.color ?? null,
      user_id: userData.user.id,
      order_index: nextOrderIndex,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw new Error("Failed to create note");
  }

  revalidatePath("/dashboard");
  return data.id;
}

export async function updateNote(
  id: string,
  formData: { text: string; color?: string | null },
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("notes")
    .update({
      text: formData.text,
      color: formData.color ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }

  revalidatePath("/dashboard");
}

export async function deleteNote(id: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }

  revalidatePath("/dashboard");
}

export async function deleteNotes(ids: string[]) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  if (uniqueIds.length === 0) return;

  const { error } = await supabase
    .from("notes")
    .delete()
    .in("id", uniqueIds)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting notes:", error);
    throw new Error("Failed to delete notes");
  }

  revalidatePath("/dashboard");
}
