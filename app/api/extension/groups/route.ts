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
