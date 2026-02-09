"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkDuplicateGroup(
  name: string,
  excludeId?: string,
): Promise<{
  exists: boolean;
  group?: { id: string; name: string };
}> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const normalizedName = name.trim().toLowerCase();

  const { data } = await supabase
    .from("groups")
    .select("id, name")
    .eq("user_id", userData.user.id);

  const existingGroup = data?.find(
    (group) =>
      group.name?.trim().toLowerCase() === normalizedName &&
      (!excludeId || group.id !== excludeId),
  );

  if (existingGroup) {
    return { exists: true, group: existingGroup };
  }
  return { exists: false };
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
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A group with this name already exists");
    }
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
    if (error.code === "23505") {
      throw new Error("A group with this name already exists");
    }
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

export async function restoreGroup(group: {
  id: string;
  name: string;
  icon: string;
  color?: string | null;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("groups")
    .upsert({
      id: group.id,
      name: group.name,
      icon: group.icon,
      color: group.color ?? null,
      user_id: userData.user.id,
    })
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error restoring group:", error);
    throw new Error("Failed to restore group");
  }

  revalidatePath("/dashboard");
}
