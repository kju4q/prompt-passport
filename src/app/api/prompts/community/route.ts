import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch prompts where type is 'submitted' (user-submitted prompts)
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("type", "submitted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community prompts:", error);
      return NextResponse.json(
        { error: "Failed to fetch community prompts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Error in community prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
