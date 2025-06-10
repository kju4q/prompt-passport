"use client";

import PromptCard from "@/components/PromptCard";
import { Prompt } from "@/types/prompt";

const tiktokPrompts: Prompt[] = [
  {
    id: "tiktok-1",
    content:
      "Create a viral TikTok script where an AI assistant gives brutally honest life advice to a Gen Z creator. Keep it witty, relatable, and loop-worthy.",
    source: "tiktok",
    creator: "Promptpin",
    usage_count: 432,
    tags: ["AI", "scriptwriting", "GenZ", "viral"],
    created_at: new Date().toISOString(),
  },
  {
    id: "tiktok-2",
    content:
      "Design a ChatGPT prompt that generates hyper-aesthetic, dreamy daily routines inspired by TikTok influencers. Include time stamps and mood descriptions.",
    source: "tiktok",
    creator: "Promptpin",
    usage_count: 299,
    tags: ["aesthetic", "wellness", "routine", "influencer"],
    created_at: new Date().toISOString(),
  },
];

export default function TikTokPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-white">TikTok Prompts</h1>
      {tiktokPrompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </main>
  );
}
