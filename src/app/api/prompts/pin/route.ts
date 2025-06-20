import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/app/api/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  console.log("🔍 Pin API Debug - Starting pin API request");

  try {
    const session = await auth();
    console.log("🔍 Pin API Debug - Session:", session);
    console.log("🔍 Pin API Debug - Session user ID:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("🔍 Pin API Debug - No session or user ID found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("🔍 Pin API Debug - Request body:", body);

    const { prompt_id, pin } = body;
    console.log("🔍 Pin API Debug - Extracted prompt_id:", prompt_id);
    console.log("🔍 Pin API Debug - Extracted pin:", pin);

    if (!prompt_id) {
      console.log("🔍 Pin API Debug - Missing prompt_id");
      return NextResponse.json({ error: "Missing prompt_id" }, { status: 400 });
    }

    if (pin) {
      console.log("🔍 Pin API Debug - Attempting to pin prompt");
      // Pin: insert if not exists
      const { error } = await supabase
        .from("pinned")
        .upsert([{ prompt_id, user_id: session.user.id }], {
          onConflict: "pinned_prompt_id_user_id_key",
        });

      console.log("🔍 Pin API Debug - Upsert result error:", error);

      if (error) {
        console.error("🔍 Pin API Debug - Upsert failed:", error);
        // Fallback: try insert, ignore if already exists
        console.log("🔍 Pin API Debug - Trying fallback insert approach");
        const { error: insertError } = await supabase
          .from("pinned")
          .insert([{ prompt_id, user_id: session.user.id }]);

        if (insertError && !insertError.message.includes("duplicate key")) {
          console.error(
            "🔍 Pin API Debug - Fallback insert also failed:",
            insertError
          );
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
          );
        }
      }

      console.log("🔍 Pin API Debug - Pin successful");
      return NextResponse.json({ success: true });
    } else {
      console.log("🔍 Pin API Debug - Attempting to unpin prompt");
      // Unpin: delete
      const { error } = await supabase
        .from("pinned")
        .delete()
        .eq("prompt_id", prompt_id)
        .eq("user_id", session.user.id);

      console.log("🔍 Pin API Debug - Delete result error:", error);

      if (error) {
        console.error("🔍 Pin API Debug - Delete failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("🔍 Pin API Debug - Unpin successful");
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("🔍 Pin API Debug - Caught exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
