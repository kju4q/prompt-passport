import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { originalPrompt, remixType, parentId } = await req.json();
    if (!originalPrompt || !remixType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock remixing logic (replace with AI logic later)
    const remixedPrompt = `${originalPrompt} [Remixed: ${remixType}]`;

    return NextResponse.json({ remixedPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
