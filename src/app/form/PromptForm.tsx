"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/contexts/VerificationContext";

export default function PromptForm() {
  const { isVerified, nullifierHash } = useVerification();
  const [text, setText] = useState("");
  const [modelTag, setModelTag] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const { error } = await supabase.from("prompts").insert([
      {
        text,
        model_tag: modelTag,
        source_tag: sourceTag,
        tags: tagArray,
        type: "submitted",
        created_by: nullifierHash || "anonymous", // Use the actual nullifier hash
      },
    ]);

    setLoading(false);
    if (error) {
      console.error("Insert error:", error);
    } else {
      setText("");
      setModelTag("");
      setSourceTag("");
      setTags("");
      alert("Prompt submitted!");
    }
  }

  // Show verification prompt if not verified
  if (!isVerified) {
    return (
      <div className="text-center text-sm text-gray-400 mt-6">
        <p>Please verify with World ID to submit prompts.</p>
        <p className="text-xs mt-2">
          You'll be redirected here after verification.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        placeholder="Enter your prompt"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Model tag (e.g. GPT-4)"
        value={modelTag}
        onChange={(e) => setModelTag(e.target.value)}
        className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded"
      />
      <input
        type="text"
        placeholder="Source tag (e.g. Twitter)"
        value={sourceTag}
        onChange={(e) => setSourceTag(e.target.value)}
        className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded"
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Prompt"}
      </Button>
    </form>
  );
}
