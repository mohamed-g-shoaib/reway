import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeUrl } from "@/lib/metadata";
import { corsHeaders, jsonResponse } from "../utils";

interface BookmarkPayload {
  url: string;
  title?: string;
  description?: string;
  groupId?: string | null;
  faviconUrl?: string | null;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const payload = (await request.json()) as BookmarkPayload;

    if (!payload?.url) {
      return jsonResponse({ error: "Missing url" }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(payload.url);
    const title = payload.title?.trim() || normalizedUrl;
    const description = payload.description?.trim() || null;
    const faviconUrl = payload.faviconUrl?.trim() || null;

    if (payload.groupId) {
      const { data: group, error: groupError } = await supabaseAdmin
        .from("groups")
        .select("id")
        .eq("id", payload.groupId)
        .eq("user_id", userId)
        .maybeSingle();

      if (groupError) {
        console.error("Failed to validate groupId:", groupError);
        return jsonResponse({ error: "Invalid group" }, { status: 400 });
      }

      if (!group) {
        return jsonResponse({ error: "Invalid group" }, { status: 400 });
      }
    }

    const { data: minOrderData, error: orderError } = await supabaseAdmin
      .from("bookmarks")
      .select("order_index")
      .eq("user_id", userId)
      .order("order_index", { ascending: true })
      .limit(1)
      .single();

    if (orderError) {
      console.error("Failed to get order index:", orderError);
    }

    const nextOrderIndex = minOrderData
      ? (minOrderData.order_index ?? 0) - 1
      : 0;

    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .insert({
        url: normalizedUrl,
        normalized_url: normalizedUrl,
        title,
        description,
        favicon_url: faviconUrl,
        group_id: payload.groupId ?? null,
        user_id: userId,
        status: "ready",
        last_fetched_at: new Date().toISOString(),
        order_index: nextOrderIndex,
      })
      .select(
        "id, url, normalized_url, title, description, group_id, created_at, order_index, status, favicon_url, og_image_url, image_url",
      )
      .single();

    if (error) {
      console.error("Failed to create bookmark:", error);

      // Unique constraint violation (e.g., duplicate within the same group)
      // Supabase/Postgres uses 23505 for unique_violation.
      if ((error as { code?: string })?.code === "23505") {
        return jsonResponse(
          { error: "Bookmark already exists" },
          { status: 409 },
        );
      }

      return jsonResponse(
        { error: "Failed to create bookmark" },
        { status: 500 },
      );
    }

    try {
      const channel = supabaseAdmin.channel(`user:${userId}:bookmarks`, {
        config: { private: true },
      });
      await channel.send({
        type: "broadcast",
        event: "INSERT",
        payload: data,
      });
      supabaseAdmin.removeChannel(channel);
    } catch (broadcastError) {
      console.warn("Realtime broadcast failed (bookmarks):", broadcastError);
    }

    return jsonResponse({ id: data.id, bookmark: data });
  } catch (error) {
    console.error("Extension auth failed:", error);
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    const query = supabaseAdmin
      .from("bookmarks")
      .select("id, url, title, description, group_id, created_at, order_index")
      .eq("user_id", userId);

    if (groupId && groupId !== "all") {
      query.eq("group_id", groupId);
    }

    const { data, error } = await query
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch bookmarks:", error);
      return jsonResponse(
        { error: "Failed to fetch bookmarks" },
        { status: 500 },
      );
    }

    return jsonResponse({ bookmarks: data ?? [] });
  } catch (error) {
    console.error("Extension auth failed:", error);
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
}
