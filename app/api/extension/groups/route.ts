import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { corsHeaders, jsonResponse } from "../utils";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const { userId } = await requireExtensionAuth();

    const { data, error } = await supabaseAdmin
      .from("groups")
      .select("id, name, icon, color, order_index, created_at")
      .eq("user_id", userId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Failed to fetch groups:", error);
      return jsonResponse({ error: "Failed to fetch groups" }, { status: 500 });
    }

    return jsonResponse({ groups: data ?? [] });
  } catch (error) {
    console.error("Extension auth failed:", error);
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireExtensionAuth();
    const body = await request.json();

    if (!body?.name?.trim()) {
      return jsonResponse({ error: "Group name is required" }, { status: 400 });
    }

    // Get the maximum order_index to append new group at the end
    const { data: maxOrderData } = await supabaseAdmin
      .from("groups")
      .select("order_index")
      .eq("user_id", userId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = maxOrderData
      ? (maxOrderData.order_index ?? 0) + 1
      : 0;

    const { data, error } = await supabaseAdmin
      .from("groups")
      .insert({
        name: body.name.trim(),
        icon: body.icon || null,
        color: body.color || null,
        user_id: userId,
        order_index: nextOrderIndex,
      })
      .select("id, name, icon, color, order_index, created_at")
      .single();

    if (error) {
      console.error("Failed to create group:", error);
      return jsonResponse({ error: "Failed to create group" }, { status: 500 });
    }

    try {
      const channel = supabaseAdmin.channel(`user:${userId}:groups`, {
        config: { private: true },
      });
      await channel.send({
        type: "broadcast",
        event: "INSERT",
        payload: data,
      });
      supabaseAdmin.removeChannel(channel);
    } catch (broadcastError) {
      console.warn("Realtime broadcast failed (groups):", broadcastError);
    }

    return jsonResponse({ group: data });
  } catch (error) {
    console.error("Extension auth failed:", error);
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
}
