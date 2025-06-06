import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  try {
    const prompt = `
Generate 10 high-quality, viral-style prompts for AI tools like ChatGPT. 
Each prompt should be optimized for shareability and usefulness. Follow these rules:

- Each prompt must perform a creative, ambitious, or highly practical task
- Include the target user persona (e.g. SaaS founder, solo creator, UX designer)
- Cover diverse use cases (writing, coding, marketing, productivity, education, wellness, etc.)
- Avoid generic or basic prompts — make them feel like hidden gems
- Format each as a JSON object with:
  - content (string) – the prompt itself
  - tags (array of strings) – categories or topic labels
  - source: "AI"
Return the final result as a JSON array of 10 items.
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
      const jsonString = content.match(/\[.*\]/s)?.[0];
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
