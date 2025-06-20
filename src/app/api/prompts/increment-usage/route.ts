import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    console.log("🔍 Increment Usage Debug - Prompt ID:", id);

    if (!id) {
      console.log("🔍 Increment Usage Debug - Missing prompt id");
      return NextResponse.json({ error: "Missing prompt id" }, { status: 400 });
    }

    // Use direct UPDATE instead of RPC function to avoid function signature issues
    // First get the current usage count
    const { data: currentData, error: fetchError } = await supabase
      .from("prompts")
      .select("usage_count")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("🔍 Increment Usage Debug - Fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const currentUsageCount = currentData?.usage_count || 0;
    const newUsageCount = currentUsageCount + 1;

    // Update with the new usage count
    const { data, error } = await supabase
      .from("prompts")
      .update({
        usage_count: newUsageCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("usage_count");

    console.log("🔍 Increment Usage Debug - Update result:", { data, error });

    if (error) {
      console.error("🔍 Increment Usage Debug - Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      "🔍 Increment Usage Debug - Success, new usage count:",
      data?.[0]?.usage_count
    );
    return NextResponse.json({
      success: true,
      new_usage_count: data?.[0]?.usage_count,
    });
  } catch (error) {
    console.error("🔍 Increment Usage Debug - Exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
