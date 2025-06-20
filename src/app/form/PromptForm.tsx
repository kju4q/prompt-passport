"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PromptForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [modelTag, setModelTag] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Generate a unique string ID for the prompt
    const newPromptId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { error } = await supabase.from("prompts").insert([
      {
        id: newPromptId,
        text,
        model_tag: modelTag,
        source_tag: sourceTag,
        tags: tagArray,
        type: "submitted",
        created_by: (session?.user as any)?.address || "anonymous",
        user_id: (session?.user as any)?.id || null,
        usage_count: 0,
        pin_count: 0,
      },
    ]);

    setLoading(false);
    if (error) {
      console.error("Insert error:", error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/community");
      }, 2000);
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="text-center text-sm text-gray-400 mt-6">
        <p>Loading...</p>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="text-center text-sm text-gray-400 mt-6">
        <p>Please sign in with World ID to submit prompts.</p>
        <p className="text-xs mt-2">
          You'll be redirected here after signing in.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-sm text-green-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <p className="text-lg font-medium mb-2">
            Prompt submitted successfully!
          </p>
          <p className="text-xs text-gray-400">Redirecting to community...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Prompt Text
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model Tag
          </label>
          <Input
            type="text"
            value={modelTag}
            onChange={(e) => setModelTag(e.target.value)}
            placeholder="e.g., GPT-4, Claude"
            className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Source Tag
          </label>
          <Input
            type="text"
            value={sourceTag}
            onChange={(e) => setSourceTag(e.target.value)}
            placeholder="e.g., Community, Tutorial"
            className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <Input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., creative, writing, brainstorming"
          className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Prompt"}
      </Button>
    </form>
  );
}
