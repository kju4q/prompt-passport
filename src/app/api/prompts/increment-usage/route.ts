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

    // Call the Postgres function to increment usage_count
    const { data, error } = await supabase.rpc("increment_usage_count", {
      prompt_id: id,
    });

    console.log("🔍 Increment Usage Debug - RPC result:", { data, error });

    if (error) {
      console.error("🔍 Increment Usage Debug - RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("🔍 Increment Usage Debug - Success");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔍 Increment Usage Debug - Exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
