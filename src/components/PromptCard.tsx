"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Bookmark, Quote } from "lucide-react";

export interface Prompt {
  id: string;
  content: string;
  source: string;
  creator: string;
  usage_count: number;
  tags: string[];
  created_at: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onUse?: (promptId: string) => void;
}

export default function PromptCard({ prompt, onUse }: PromptCardProps) {
  const [isUsed, setIsUsed] = useState(false);
  const [currentUsageCount, setCurrentUsageCount] = useState(
    prompt.usage_count
  );
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleUsePrompt = async () => {
    try {
      const encodedPrompt = encodeURIComponent(prompt.content);
      const chatGPTUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
      window.open(chatGPTUrl, "_blank");

      setIsUsed(true);
      setCurrentUsageCount((prev) => prev + 1);
      onUse?.(prompt.id);

      toast.success("Opening in ChatGPT...", {
        description: "You can edit and send the prompt there",
      });

      setTimeout(() => setIsUsed(false), 2000);
    } catch (error) {
      console.error("Failed to open ChatGPT:", error);
      toast.error("Couldn't open ChatGPT");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed" : "Saved!");
  };

  const getSourceEmoji = (source: string) => {
    switch (source.toLowerCase()) {
      case "twitter":
        return "";
      case "tiktok":
        return "";
      case "github":
        return "";
      case "manual":
        return "";
      case "community":
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="group relative break-inside-avoid mb-6">
      {/* Quote-style Card - Dark Theme */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/70 relative overflow-hidden">
        {/* Quote Icon */}
        <div className="absolute top-4 left-4 opacity-20">
          <Quote className="h-8 w-8 text-gray-400" />
        </div>

        {/* Content */}
        <div className="relative z-10 pl-8">
          {/* Prompt Content - Quote Style */}
          <div className="mb-6">
            <p className="text-gray-200 leading-relaxed text-base font-normal italic">
              "{prompt.content}"
            </p>
          </div>

          {/* Attribution */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-base">{getSourceEmoji(prompt.source)}</span>
              <span className="font-medium text-gray-300">
                {prompt.creator}
              </span>
              <span>•</span>
              <span>{prompt.source}</span>
            </div>

            <button
              onClick={handleBookmark}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 hover:bg-gray-700/50 rounded-full"
            >
              <Bookmark
                className={`h-4 w-4 transition-colors ${
                  isBookmarked
                    ? "fill-blue-400 text-blue-400"
                    : "text-gray-500 hover:text-blue-400"
                }`}
              />
            </button>
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
              {isUsed ? (
                <>Copied</>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-2" />
                  Use This
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
