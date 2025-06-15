"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/contexts/VerificationContext";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PromptForm() {
  const router = useRouter();
  const { isVerified, nullifierHash } = useVerification();
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
        created_by: nullifierHash || "anonymous",
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

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-medium text-gray-200">
          Prompt Submitted!
        </h2>
        <p className="text-gray-400">Redirecting to community page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Prompt Text
        </label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
          rows={4}
          required
        />
      </div>

      <div>
        <label
          htmlFor="modelTag"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Model Tag
        </label>
        <Input
          type="text"
          id="modelTag"
          value={modelTag}
          onChange={(e) => setModelTag(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
          required
        />
      </div>

      <div>
        <label
          htmlFor="sourceTag"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Source Tag
        </label>
        <Input
          type="text"
          id="sourceTag"
          value={sourceTag}
          onChange={(e) => setSourceTag(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
          required
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Tags (comma-separated)
        </label>
        <Input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
          placeholder="e.g. writing, creative, business"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Prompt"}
      </Button>
    </form>
  );
}
