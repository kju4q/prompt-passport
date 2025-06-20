import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/app/api/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get prompts created by this user
    const { data: createdPrompts, error: createdError } = await supabase
      .from("prompts")
      .select("id, usage_count")
      .eq("user_id", userId);

    if (createdError) {
      console.error("Error fetching created prompts:", createdError);
      return NextResponse.json(
        { error: createdError.message },
        { status: 500 }
      );
    }

    // Get pinned prompts count
    const { count: pinnedCount, error: pinnedError } = await supabase
      .from("pinned")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (pinnedError) {
      console.error("Error fetching pinned count:", pinnedError);
      return NextResponse.json({ error: pinnedError.message }, { status: 500 });
    }

    // Calculate total usage from created prompts
    const totalUsage =
      createdPrompts?.reduce(
        (sum, prompt) => sum + (prompt.usage_count || 0),
        0
      ) || 0;

    const stats = {
      promptsCreated: createdPrompts?.length || 0,
      promptsPinned: pinnedCount || 0,
      totalUsage: totalUsage,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("User stats API error:", error);
    return NextResponse.json(
      { error: error?.toString() || "Internal server error" },
      { status: 500 }
    );
  }
}
