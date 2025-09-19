import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keep cached AI prompts fresh without hammering the model
const CACHE_TTL_HOURS = Number(process.env.PROMPT_CACHE_TTL_HOURS ?? "24");
const CACHE_TTL_MS =
  Number.isFinite(CACHE_TTL_HOURS) && CACHE_TTL_HOURS > 0
    ? CACHE_TTL_HOURS * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

export async function POST() {
  try {
    // 1) Return cached prompts if we already have AI prompts in DB
    //    This avoids generating on every feed load.
    const { data: cached, error: cacheError } = await supabase
      .from("prompts")
      .select("id, title, content, text, tags, source, usage_count, creator, created_at")
      .eq("source", "AI")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!cacheError && cached && cached.length > 0) {
      const newestCreatedAt = cached.reduce<string | null>((latest, current) => {
        if (!current?.created_at) return latest;
        if (!latest) return current.created_at;
        return new Date(current.created_at) > new Date(latest)
          ? current.created_at
          : latest;
      }, null);

      const isFresh = !!newestCreatedAt
        ? Date.now() - new Date(newestCreatedAt).getTime() < CACHE_TTL_MS
        : false;

      if (isFresh) {
        const normalized = cached.map((p: any) => ({
          id: p.id,
          title:
            p.title || (p.text ? String(p.text).slice(0, 50) + "..." : "Untitled"),
          content: p.content || p.text,
          tags: p.tags || [],
          source: p.source || "AI",
          usage_count: p.usage_count || 0,
          creator: p.creator || "AI",
          created_at: p.created_at,
        }));
        return NextResponse.json({ prompts: normalized });
      }
    }

    // 2) Otherwise, generate a fresh batch (first-time bootstrap)
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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative prompt engineer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
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
