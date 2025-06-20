"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Bookmark, Quote, Pin, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export interface Prompt {
  id: string;
  content: string;
  source: string;
  creator: string;
  usage_count: number;
  tags: string[];
  created_at: string;
  text?: string;
  // New evolution fields
  parent_id?: string;
  generation?: number;
  remix_type?: string;
  likes?: number;
  rating?: number;
  title?: string;
  model_tag?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onPin?: (promptId: string, pinned: boolean) => void;
  isPinned?: boolean;
}

export default function PromptCard({
  prompt,
  onPin,
  isPinned,
}: PromptCardProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(isPinned || false);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(prompt.usage_count || 0);

  // Update local state when isPinned prop changes
  useEffect(() => {
    setPinned(isPinned || false);
  }, [isPinned]);

  // Update usage count when prompt prop changes
  useEffect(() => {
    setUsageCount(prompt.usage_count || 0);
  }, [prompt.usage_count]);

  const handleCopy = async () => {
    const textToCopy = prompt.text || prompt.content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy prompt");
    }
  };

  const handlePin = async () => {
    if (!session?.user) {
      toast.error("Please sign in to pin prompts");
      return;
    }

    console.log("🔍 Pin Debug - Starting pin operation");
    console.log("🔍 Pin Debug - Session user:", session.user);
    console.log("🔍 Pin Debug - Prompt ID:", prompt.id);
    console.log("🔍 Pin Debug - Current pinned state:", pinned);
    console.log("🔍 Pin Debug - New pin state:", !pinned);

    setLoading(true);
    try {
      const requestBody = {
        prompt_id: prompt.id,
        pin: !pinned,
      };

      console.log("🔍 Pin Debug - Request body:", requestBody);

      const response = await fetch("/api/prompts/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🔍 Pin Debug - Response status:", response.status);
      console.log("🔍 Pin Debug - Response ok:", response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log("🔍 Pin Debug - Response data:", responseData);

        setPinned(!pinned);
        if (onPin) {
          onPin(prompt.id, !pinned);
        }
        toast.success(pinned ? "Prompt unpinned" : "Prompt pinned!");
      } else {
        const errorData = await response.json();
        console.error("🔍 Pin Debug - Error response:", errorData);
        toast.error(
          `Failed to pin prompt: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("🔍 Pin Debug - Network error:", error);
      toast.error("Failed to pin prompt - network error");
    } finally {
      setLoading(false);
    }
  };

  const handleUsageIncrement = async () => {
    try {
      const response = await fetch("/api/prompts/increment-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: prompt.id }),
      });

      if (response.ok) {
        // Update local usage count immediately
        setUsageCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to increment usage:", error);
    }
  };

  const handleUsePrompt = async () => {
    const promptText = prompt.text || prompt.content;

    // Detect model from tags or model_tag field
    const modelTag = prompt.model_tag || "";
    const tags = prompt.tags || [];

    // Check for model indicators in tags or model_tag
    const isChatGPT =
      modelTag.toLowerCase().includes("gpt") ||
      modelTag.toLowerCase().includes("chatgpt") ||
      tags.some(
        (tag) =>
          tag.toLowerCase().includes("gpt") ||
          tag.toLowerCase().includes("chatgpt")
      );

    const isClaude =
      modelTag.toLowerCase().includes("claude") ||
      tags.some((tag) => tag.toLowerCase().includes("claude"));

    const isGemini =
      modelTag.toLowerCase().includes("gemini") ||
      tags.some((tag) => tag.toLowerCase().includes("gemini"));

    // Open appropriate model with the prompt
    if (isChatGPT) {
      window.open(
        `https://chat.openai.com/?prompt=${encodeURIComponent(promptText)}`,
        "_blank"
      );
    } else if (isClaude) {
      window.open(
        `https://claude.ai/?prompt=${encodeURIComponent(promptText)}`,
        "_blank"
      );
    } else if (isGemini) {
      window.open(
        `https://gemini.google.com/?prompt=${encodeURIComponent(promptText)}`,
        "_blank"
      );
    } else {
      // Default to ChatGPT if no specific model detected
      window.open(
        `https://chat.openai.com/?prompt=${encodeURIComponent(promptText)}`,
        "_blank"
      );
    }

    // Increment usage count
    await handleUsageIncrement();
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all mb-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-200 mb-2 line-clamp-1">
              {prompt.title || "Untitled Prompt"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>
                by{" "}
                {prompt.creator?.startsWith("0x")
                  ? `User ${prompt.creator.slice(2, 6).toUpperCase()}`
                  : prompt.creator}
              </span>
              <span>•</span>
              <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePin}
              disabled={loading}
              className="text-gray-400 hover:text-yellow-400"
            >
              <Pin
                className={`w-4 h-4 ${
                  pinned ? "fill-yellow-400 text-yellow-400" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-400 hover:text-blue-400"
            >
              <Copy className={`w-4 h-4 ${copied ? "text-blue-400" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed line-clamp-2">
            {prompt.text || prompt.content}
          </p>
          {(prompt.text || prompt.content)?.length > 100 && (
            <Link
              href={`/prompt/${prompt.id}`}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
            >
              View more...
            </Link>
          )}
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Used {usageCount} times</span>
            {prompt.likes && <span>❤️ {prompt.likes}</span>}
            {prompt.generation && (
              <span className="text-blue-400">Gen {prompt.generation}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUsePrompt}
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
            >
              Use Prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`/prompt/${prompt.id}?evolve=creative`, "_blank");
              }}
              className="bg-gray-800/50 border-emerald-600 text-emerald-400 hover:bg-emerald-700/20 hover:border-emerald-500"
            >
              🧬 Evolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
