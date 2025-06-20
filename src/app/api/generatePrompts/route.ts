import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

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
    - For each prompt, generate a 'title' field: a 5-word hook that summarizes the prompt and grabs attention (do not repeat the prompt text)
    
    Format each as a JSON object with:
      - title (string) – a 5-word hook for the prompt
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

      // Save generated prompts to database
      const promptsToInsert = json.map((p: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: p.title,
        text: p.content,
        content: p.content,
        tags: p.tags,
        source: "AI",
        source_tag: "AI",
        usage_count: 0, // Start with 0, not random number
        creator: "AI",
        created_by: "AI",
        type: "submitted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), // Add updated_at field
      }));

      console.log("🔍 Generate Debug - Data to insert:", promptsToInsert[0]); // Log first prompt

      // Insert prompts into database
      const { data: insertData, error: insertError } = await supabase
        .from("prompts")
        .insert(promptsToInsert)
        .select(); // Add .select() to see what was actually inserted

      if (insertError) {
        console.error("Error inserting generated prompts:", insertError);
        // Continue anyway, return the prompts even if database insert fails
      } else {
        console.log(
          "Successfully inserted",
          promptsToInsert.length,
          "prompts to database"
        );
        console.log("🔍 Generate Debug - Inserted data:", insertData?.[0]); // Log first inserted prompt
      }

      const enriched = promptsToInsert.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        tags: p.tags,
        source: "AI",
        usage_count: p.usage_count,
        creator: "AI",
        created_at: p.created_at,
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
