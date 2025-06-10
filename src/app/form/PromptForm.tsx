"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface PromptFormProps {
  nullifierHash: string;
}

export default function PromptForm({ nullifierHash }: PromptFormProps) {
  const [text, setText] = useState("");
  const [modelTag, setModelTag] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [tags, setTags] = useState(""); // comma-separated
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const { error } = await supabase.from("prompts").insert([
      {
        text,
        model_tag: modelTag,
        source_tag: sourceTag,
        tags: tagArray,
        type: "submitted",
        created_by: nullifierHash,
      },
    ]);

    setLoading(false);
    if (error) {
      console.error("Insert error:", error);
      alert("Failed to submit prompt");
    } else {
      setText("");
      setModelTag("");
      setSourceTag("");
      setTags("");
      alert("Prompt submitted!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        placeholder="Enter your prompt"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Model tag (e.g. GPT-4)"
        value={modelTag}
        onChange={(e) => setModelTag(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Source tag (e.g. TikTok)"
        value={sourceTag}
        onChange={(e) => setSourceTag(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Prompt"}
      </Button>
    </form>
  );
}
