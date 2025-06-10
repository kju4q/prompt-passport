import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  try {
    const prompt = `
    You're a top-tier AI prompt curator for creators, growth hackers, and trend-watchers.
    
    Generate 10 *viral-style* prompts for ChatGPT. Follow these rules:
    
    - Each prompt must spark creativity, weirdness, or productivity — think "hidden gems" for building, reflecting, or storytelling
    - Use current internet trends (e.g. vibe coding, AI girlfriends, romanticize your life, therapy-speak, Gen Z slang, side hustles)
    - Include the *target user persona* (e.g. Gen Z creator, solo founder, indie hacker, UX therapist)
    - Make them *specific and remixable* — avoid vague or generic ideas
    - Style them for shareability on TikTok, Twitter, or Threads
    
    Format each as a JSON object with:
      - content (string) – the prompt itself
      - tags (array of strings) – categories or topic labels
      - source: "AI"
    
    Return a JSON array of 10 objects.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a creative prompt engineer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    });

    const content = completion.choices[0].message.content;

    if (content) {
      const jsonString = content.match(/\[[\s\S]*\]/)?.[0];
      if (!jsonString) throw new Error("No JSON array found in the response.");

      const json = JSON.parse(jsonString);
      const enriched = json.map((p: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        content: p.content,
        tags: p.tags,
        source: "AI",
        usage_count: Math.floor(Math.random() * 100),
        creator: "Promptpin AI",
        created_at: new Date().toISOString(),
      }));

      return NextResponse.json({ prompts: enriched });
    } else {
      throw new Error("No content received from OpenAI API.");
    }
  } catch (error) {
    console.error("Prompt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prompts." },
      { status: 500 }
    );
  }
}
