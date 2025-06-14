"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Copy, Bookmark, Quote, Pin, X } from "lucide-react";
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
  // New evolution fields
  parent_id?: string;
  generation?: number;
  remix_type?: string;
  likes?: number;
  rating?: number;
  title?: string;
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

  // Evolution bottom sheet states
  const [showEvolutionSheet, setShowEvolutionSheet] = useState(false);
  const [selectedRemixType, setSelectedRemixType] = useState<string>("");
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixProgress, setRemixProgress] = useState(0);
  const [remixResult, setRemixResult] = useState("");

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

  const handleRemix = async (remixType: string) => {
    setIsRemixing(true);
    setRemixProgress(0);
    setSelectedRemixType(remixType);

    const progressInterval = setInterval(() => {
      setRemixProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      const response = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: prompt.text || prompt.content,
          remixType: remixType,
          parentId: prompt.id,
        }),
      });

      const result = await response.json();
      setRemixResult(result.remixedPrompt);
      setRemixProgress(100);

      toast.success("Evolution complete!");
    } catch (error) {
      console.error("Remix failed:", error);
      toast.error("Evolution failed");
    } finally {
      setIsRemixing(false);
      clearInterval(progressInterval);
    }
  };

  const closeEvolutionSheet = () => {
    setShowEvolutionSheet(false);
    setRemixResult("");
    setRemixProgress(0);
    setIsRemixing(false);
  };

  return (
    <>
      <div className="group relative break-inside-avoid mb-6">
        {/* Subtle scanning line on hover */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Original card styling - CLEAN & UNCLUTTERED */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:bg-gray-800/70 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-emerald-500/5">
          {/* Simple generation badge - only if exists */}
          {prompt.generation !== undefined && prompt.generation > 0 && (
            <div className="absolute top-4 right-4">
              <Badge
                variant="outline"
                className="border-blue-500/40 text-blue-400 text-xs"
              >
                Gen {prompt.generation}
              </Badge>
            </div>
          )}

          {/* Prompt Title and Pin Button Row */}
          {(prompt.title || typeof isBookmarked !== "undefined") && (
            <div className="flex items-center gap-2 mb-2">
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
              {prompt.title && (
                <h2 className="text-lg font-semibold text-white leading-tight truncate">
                  {prompt.title}
                </h2>
              )}
            </div>
          )}

          {/* Content - keeping your exact original layout */}
          <div className="relative z-10">
            {/* Prompt Content - Quote Style */}
            <div className="mb-6">
              <p
                className="text-gray-200 leading-relaxed text-base font-normal italic line-clamp-2"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
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

            {/* Bottom Actions - CLEAN LAYOUT */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{currentUsageCount} uses</span>
                {prompt.likes !== undefined && <span>👍 {prompt.likes}</span>}
              </div>

              <div className="flex items-center gap-2">
                {/* NEW: Clean Evolve button */}
                <Button
                  size="sm"
                  onClick={() => setShowEvolutionSheet(true)}
                  className="group rounded-full font-medium text-sm px-2 py-1 border transition-all duration-300 cursor-pointer bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800/40 hover:border-blue-400 hover:text-blue-400 flex items-center gap-1 overflow-hidden"
                >
                  <span className="text-lg">🧬</span>
                  <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap pl-1">
                    Evolve
                  </span>
                </Button>

                {/* Use button - unchanged */}
                <Button
                  onClick={handleUsePrompt}
                  disabled={isUsed}
                  size="sm"
                  className={`
                    rounded-full font-medium text-sm px-4 py-1 border transition-all duration-300 cursor-pointer
                    bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800/40 hover:border-blue-400 hover:text-blue-400
                    ${
                      isUsed
                        ? "border-green-600 text-green-400 bg-green-600/10"
                        : ""
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

      {/* Evolution Bottom Sheet */}
      {showEvolutionSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={closeEvolutionSheet}
          />

          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-emerald-500/30 rounded-t-2xl animate-slide-up">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-emerald-400">
                🧬 Evolve Prompt
              </h3>
              <button
                onClick={closeEvolutionSheet}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Original prompt preview */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">
                  Original Prompt
                </label>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-sm text-gray-200">
                  {prompt.text || prompt.content}
                </div>
              </div>

              {/* Evolution options */}
              {!isRemixing && !remixResult && (
                <div className="space-y-3 mb-6">
                  <label className="text-sm text-gray-400 block mb-3">
                    Choose Evolution Style
                  </label>

                  <Button
                    onClick={() => handleRemix("creative")}
                    className="w-full justify-start h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400"
                  >
                    <span className="text-lg mr-3">✨</span>
                    <div className="text-left">
                      <div className="font-medium">Creative Evolution</div>
                      <div className="text-xs opacity-70">
                        Make it artistic and imaginative
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleRemix("professional")}
                    className="w-full justify-start h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400"
                  >
                    <span className="text-lg mr-3">💼</span>
                    <div className="text-left">
                      <div className="font-medium">Professional Evolution</div>
                      <div className="text-xs opacity-70">
                        Make it business-ready and formal
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleRemix("detailed")}
                    className="w-full justify-start h-12 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400"
                  >
                    <span className="text-lg mr-3">🔍</span>
                    <div className="text-left">
                      <div className="font-medium">Detailed Evolution</div>
                      <div className="text-xs opacity-70">
                        Add specifics and context
                      </div>
                    </div>
                  </Button>
                </div>
              )}

              {/* Progress */}
              {isRemixing && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-emerald-400">Evolving prompt...</span>
                    <span className="text-emerald-400">{remixProgress}%</span>
                  </div>
                  <Progress value={remixProgress} className="h-3" />
                </div>
              )}

              {/* Result */}
              {remixResult && (
                <div className="mb-6">
                  <label className="text-sm text-blue-400 block mb-2">
                    Evolved Prompt
                  </label>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30 text-sm text-gray-200">
                    {remixResult}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => {
                        toast.success("Evolution saved!");
                        closeEvolutionSheet();
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500"
                    >
                      Save Evolution
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRemixResult("");
                        setRemixProgress(0);
                      }}
                      className="border-emerald-500/50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
