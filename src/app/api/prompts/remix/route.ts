import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/app/api/auth";

// Lazy-load OpenAI client to avoid build-time environment variable issues
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { originalPrompt, remixType } = await req.json();
    if (!originalPrompt || !remixType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle manual editing - return the original prompt for user to edit
    if (remixType === "manual") {
      return NextResponse.json({
        remixedPrompt: originalPrompt,
        isManual: true,
      });
    }

    const openai = getOpenAI();

    // Create different prompts based on remix type
    let systemPrompt = "You are a creative prompt remixer.";
    let userPrompt = `Remix this prompt in a ${remixType} style:\n\n${originalPrompt}`;

    switch (remixType) {
      case "creative":
        systemPrompt =
          "You are a creative prompt remixer. Make the prompt more imaginative, artistic, and inspiring.";
        userPrompt = `Transform this prompt to be more creative and imaginative:\n\n${originalPrompt}`;
        break;
      case "professional":
        systemPrompt =
          "You are a professional prompt remixer. Make the prompt more formal, business-oriented, and structured.";
        userPrompt = `Transform this prompt to be more professional and business-focused:\n\n${originalPrompt}`;
        break;
      case "detailed":
        systemPrompt =
          "You are a detailed prompt remixer. Add more specific details, context, and instructions to make the prompt more comprehensive.";
        userPrompt = `Add more details and specificity to this prompt:\n\n${originalPrompt}`;
        break;
      default:
        systemPrompt = "You are a creative prompt remixer.";
        userPrompt = `Remix this prompt in a ${remixType} style:\n\n${originalPrompt}`;
    }

    // Use OpenAI to remix the prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
    });

    const remixedPrompt = completion.choices[0].message.content?.trim();

    return NextResponse.json({
      remixedPrompt,
      isManual: false,
    });
  } catch (err) {
    console.error("Remix API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
