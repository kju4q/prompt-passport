"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Bookmark, Quote, Pin } from "lucide-react";
import { useVerification } from "@/contexts/VerificationContext";

export interface Prompt {
  id: string;
  content: string;
  source: string;
  creator: string;
  usage_count: number;
  tags: string[];
  created_at: string;
  text?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onUse?: (promptId: string) => void;
  isPinned?: boolean;
}

export default function PromptCard({
  prompt,
  onUse,
  isPinned,
}: PromptCardProps) {
  const [isUsed, setIsUsed] = useState(false);
  const [currentUsageCount, setCurrentUsageCount] = useState(
    prompt.usage_count
  );
  const { nullifierHash } = useVerification();
  const [isBookmarked, setIsBookmarked] = useState(isPinned || false);

  useEffect(() => {
    setIsBookmarked(isPinned || false);
  }, [isPinned]);

  const handleUsePrompt = async () => {
    try {
      const encodedPrompt = encodeURIComponent(prompt.text || prompt.content);
      const chatGPTUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
      window.open(chatGPTUrl, "_blank");

      setIsUsed(true);
      setCurrentUsageCount((prev) => prev + 1);
      onUse?.(prompt.id);

      // Increment usage count in the database if prompt has a numeric id (Supabase)
      if (prompt.id && !isNaN(Number(prompt.id))) {
        fetch("/api/prompts/increment-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(prompt.id) }),
        });
      }

      toast.success("Opening in ChatGPT...", {
        description: "You can edit and send the prompt there",
      });

      setTimeout(() => setIsUsed(false), 2000);
    } catch (error) {
      console.error("Failed to open ChatGPT:", error);
      toast.error("Couldn't open ChatGPT");
    }
  };

  const handlePin = async () => {
    if (!nullifierHash || !prompt.id) return;
    const pin = !isBookmarked;
    setIsBookmarked(pin);
    await fetch("/api/prompts/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt_id: prompt.id,
        nullifier_hash: nullifierHash,
        pin,
      }),
    });
  };

  return (
    <div className="group relative break-inside-avoid mb-6">
      {/* Quote-style Card - Dark Theme */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/70 relative overflow-hidden">
        {/* Quote Icon */}
        {/* <div className="absolute top-4 left-4 opacity-20">
          <Quote className="h-8 w-8 text-gray-400" />
        </div> */}

        {/* Content */}
        <div className="relative z-10 pl-8">
          {/* Prompt Content - Quote Style */}
          <div className="mb-6">
            <p className="text-gray-200 leading-relaxed text-base font-normal italic">
              "{prompt.text || prompt.content}"
            </p>
          </div>

          {/* Attribution */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium text-gray-300">
                {prompt.creator}
              </span>
              <span>•</span>
              <span>{prompt.source}</span>
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full font-medium hover:bg-gray-700 transition-colors cursor-pointer border border-gray-600/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
            <div className="text-xs text-gray-500 font-medium">
              {currentUsageCount} uses
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePin}
                className="transition-opacity duration-300 p-1 hover:bg-gray-700/50 rounded-full relative cursor-pointer peer"
                aria-label={isBookmarked ? "Unpin" : "Pin"}
                type="button"
              >
                <Pin
                  className={`h-4 w-4 transition-colors ${
                    isBookmarked
                      ? "fill-blue-400 text-blue-400"
                      : "text-gray-500 hover:text-blue-400"
                  }`}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 rounded bg-gray-900 text-xs text-white shadow-lg opacity-0 pointer-events-none peer-hover:opacity-100 transition-opacity z-20 whitespace-nowrap flex flex-col items-center">
                  {isBookmarked ? "Unpin" : "Pin"}
                  <span className="w-2 h-2 bg-gray-900 rotate-45 mt-[-4px]"></span>
                </span>
              </button>
              <Button
                onClick={handleUsePrompt}
                disabled={isUsed}
                size="sm"
                className={`
                  rounded-full font-medium text-sm px-6 transition-all duration-300
                  ${
                    isUsed
                      ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 shadow-none border border-green-600/30"
                      : "bg-white hover:bg-gray-100 text-gray-900 hover:shadow-lg hover:scale-105"
                  }
                `}
              >
                {isUsed ? <>Copied</> : <>Use This</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
