"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Heart, Bookmark } from "lucide-react";

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
      await navigator.clipboard.writeText(prompt.content);

      setIsUsed(true);
      setCurrentUsageCount((prev) => prev + 1);
      onUse?.(prompt.id);

      toast.success("Copied! ✨", {
        description: "Ready to use in your AI tool",
      });

      setTimeout(() => setIsUsed(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Couldn't copy that");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed" : "Saved! 💫");
  };

  const getSourceEmoji = (source: string) => {
    switch (source.toLowerCase()) {
      case "twitter":
        return "🐦";
      case "tiktok":
        return "📱";
      case "github":
        return "🐙";
      case "manual":
        return "✍️";
      case "community":
        return "✨";
      default:
        return "🌸";
    }
  };

  return (
    <div className="group relative break-inside-avoid mb-6">
      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header - Minimal and Clean */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-base">{getSourceEmoji(prompt.source)}</span>
              <span className="font-medium text-gray-600">
                {prompt.creator}
              </span>
            </div>

            <button
              onClick={handleBookmark}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 hover:bg-gray-50 rounded-full"
            >
              <Bookmark
                className={`h-4 w-4 transition-colors ${
                  isBookmarked
                    ? "fill-purple-400 text-purple-400"
                    : "text-gray-300 hover:text-purple-300"
                }`}
              />
            </button>
          </div>

          {/* Prompt Content - Pinterest Style */}
          <div className="mb-6">
            <p className="text-gray-800 leading-relaxed text-base font-normal">
              {prompt.content}
            </p>
          </div>

          {/* Tags - Soft and Minimal */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Actions - Clean and Minimal */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 font-medium">
              {currentUsageCount} saves
            </div>

            <Button
              onClick={handleUsePrompt}
              disabled={isUsed}
              size="sm"
              className={`
                rounded-full font-medium text-sm px-6 transition-all duration-300
                ${
                  isUsed
                    ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none"
                    : "bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg hover:scale-105"
                }
              `}
            >
              {isUsed ? (
                <>✓ Copied</>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-2" />
                  Try it
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
