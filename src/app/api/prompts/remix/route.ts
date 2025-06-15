import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { originalPrompt, remixType } = await req.json();
    if (!originalPrompt || !remixType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use OpenAI to remix the prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a creative prompt remixer." },
        {
          role: "user",
          content: `Remix this prompt in a ${remixType} style:\n\n${originalPrompt}`,
        },
      ],
      temperature: 0.9,
    });

    const remixedPrompt = completion.choices[0].message.content?.trim();

    return NextResponse.json({ remixedPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
