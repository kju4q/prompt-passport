import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { auth } from "@/app/api/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
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

    // Get total usage count from all prompts (this represents how many times the user has used prompts)
    // We'll use a simple count of all prompts with usage_count > 0 as a proxy for user activity
    const { data: allPrompts, error: allPromptsError } = await supabase
      .from("prompts")
      .select("usage_count")
      .gt("usage_count", 0);

    if (allPromptsError) {
      console.error("Error fetching all prompts:", allPromptsError);
      return NextResponse.json(
        { error: allPromptsError.message },
        { status: 500 }
      );
    }

    // Calculate total usage from all prompts (this represents community activity)
    const totalUsage =
      allPrompts?.reduce(
        (sum, prompt) => sum + ((prompt.usage_count as number) || 0),
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
