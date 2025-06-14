import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { prompt_id, nullifier_hash, pin } = await req.json();
    if (!prompt_id || !nullifier_hash) {
      return NextResponse.json(
        { error: "Missing prompt_id or nullifier_hash" },
        { status: 400 }
      );
    }
    if (pin) {
      // Pin: insert if not exists
      const { error } = await supabase
        .from("pinned")
        .upsert(
          { prompt_id, nullifier_hash },
          { onConflict: ["prompt_id", "nullifier_hash"] }
        );
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    } else {
      // Unpin: delete
      const { error } = await supabase
        .from("pinned")
        .delete()
        .eq("prompt_id", prompt_id)
        .eq("nullifier_hash", nullifier_hash);
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
