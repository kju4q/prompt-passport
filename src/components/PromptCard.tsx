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
  showFullContent?: boolean;
}

export default function PromptCard({
  prompt,
  onPin,
  isPinned,
  showFullContent,
}: PromptCardProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(isPinned || false);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(prompt.usage_count || 0);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState("");

  // Update local state when isPinned prop changes
  useEffect(() => {
    setPinned(isPinned || false);
  }, [isPinned]);

  // Update usage count when prompt prop changes
  useEffect(() => {
    console.log("🔍 Prompt Debug - Prompt data:", {
      id: prompt.id,
      usage_count: prompt.usage_count,
      title: prompt.title,
    });
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
    console.log("🔍 Usage Debug - Starting increment for prompt:", prompt.id);
    console.log("🔍 Usage Debug - Current usage count:", usageCount);

    try {
      const response = await fetch("/api/prompts/increment-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: prompt.id }),
      });

      console.log("🔍 Usage Debug - Response status:", response.status);

      if (response.ok) {
        // Update local usage count immediately
        setUsageCount((prev) => {
          const newCount = prev + 1;
          console.log(
            "🔍 Usage Debug - Updated count from",
            prev,
            "to",
            newCount
          );
          return newCount;
        });
      } else {
        const errorData = await response.json();
        console.error("🔍 Usage Debug - API error:", errorData);
      }
    } catch (error) {
      console.error("🔍 Usage Debug - Network error:", error);
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

  const handleEvolution = async (evolutionType: string) => {
    if (!session?.user) {
      toast.error("Please sign in to evolve prompts");
      return;
    }

    setEvolutionLoading(true);
    setEvolutionResult("");

    try {
      const response = await fetch("/api/prompts/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: prompt.text || prompt.content,
          remixType: evolutionType,
          parentId: prompt.id,
        }),
      });

      const result = await response.json();

      if (result.isManual) {
        setEvolutionResult(result.remixedPrompt);
        setEvolutionLoading(false);
        return;
      }

      setEvolutionResult(result.remixedPrompt);

      // Save the evolution to the database
      const saveResponse = await fetch("/api/prompts/save-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: result.remixedPrompt,
          parentId: prompt.id,
          remixType: evolutionType,
          generation: (prompt.generation || 0) + 1,
        }),
      });

      if (saveResponse.ok) {
        toast.success("Evolution saved to community!");
        setShowEvolutionModal(false);
        setEvolutionResult("");
        // Redirect to the details page to see the evolution tree for ALL evolution types
        window.location.href = `/prompt/${prompt.id}`;
      }
    } catch (error) {
      console.error("Evolution failed:", error);
      toast.error("Evolution failed");
    } finally {
      setEvolutionLoading(false);
    }
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
          <p
            className={`text-gray-300 leading-relaxed ${
              showFullContent ? "" : "line-clamp-2"
            }`}
          >
            {prompt.text || prompt.content}
          </p>
          {!showFullContent &&
            (prompt.text || prompt.content)?.length > 100 && (
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
            <span>Used {Number(usageCount) || 0} times</span>
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
              onClick={() => setShowEvolutionModal(true)}
              className="bg-gray-800/50 border-emerald-600 text-emerald-400 hover:bg-emerald-700/20 hover:border-emerald-500"
            >
              🧬 Evolve
            </Button>
          </div>
        </div>
      </div>

      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEvolutionModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-gray-800 rounded-t-2xl border border-gray-700 shadow-2xl transform transition-all duration-300 ease-out">
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                🚀 Evolve This Prompt
              </h3>
              <p className="text-sm text-gray-400">
                Choose how you'd like to evolve this prompt
              </p>
            </div>

            {/* Evolution Options */}
            <div className="px-6 pb-6 space-y-3">
              <Button
                onClick={() => handleEvolution("creative")}
                disabled={evolutionLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 justify-start"
              >
                Creative - Make it more imaginative
              </Button>

              <Button
                onClick={() => handleEvolution("professional")}
                disabled={evolutionLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 justify-start"
              >
                Professional - Make it more formal
              </Button>

              <Button
                onClick={() => handleEvolution("detailed")}
                disabled={evolutionLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 justify-start"
              >
                Add Details - Make it more specific
              </Button>

              <Button
                onClick={() => handleEvolution("manual")}
                disabled={evolutionLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 justify-start"
              >
                Edit Yourself - Customize it manually
              </Button>
            </div>

            {/* Manual Edit Form */}
            {evolutionResult && (
              <div className="px-6 pb-6 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-200 mb-3">
                  ✏️ Edit Your Prompt
                </h4>
                <textarea
                  value={evolutionResult}
                  onChange={(e) => setEvolutionResult(e.target.value)}
                  className="w-full h-24 bg-gray-700 rounded-lg p-3 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
                  placeholder="Edit your prompt here..."
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={async () => {
                      const saveResponse = await fetch(
                        "/api/prompts/save-evolution",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            content: evolutionResult,
                            parentId: prompt.id,
                            remixType: "manual",
                            generation: (prompt.generation || 0) + 1,
                          }),
                        }
                      );
                      if (saveResponse.ok) {
                        toast.success("Manual evolution saved!");
                        setShowEvolutionModal(false);
                        setEvolutionResult("");
                        // Redirect to the details page to see the evolution tree
                        window.location.href = `/prompt/${prompt.id}`;
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Save Evolution
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEvolutionResult("")}
                    className="border-gray-600 text-gray-400 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {evolutionLoading && (
              <div className="px-6 pb-6 border-t border-gray-700 pt-4">
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-400"></div>
                  <span className="text-sm">Creating evolution...</span>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => setShowEvolutionModal(false)}
                className="w-full border-gray-600 text-gray-400"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
