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

    setLoading(true);
    try {
      const response = await fetch("/api/prompts/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt_id: prompt.id,
          pin: !pinned,
        }),
      });

      if (response.ok) {
        setPinned(!pinned);
        if (onPin) {
          onPin(prompt.id, !pinned);
        }
        toast.success(pinned ? "Prompt unpinned" : "Prompt pinned!");
      } else {
        toast.error("Failed to pin prompt");
      }
    } catch (error) {
      toast.error("Failed to pin prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleUsageIncrement = async () => {
    try {
      await fetch("/api/prompts/increment-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: prompt.id }),
      });
    } catch (error) {
      console.error("Failed to increment usage:", error);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              {prompt.title || "Untitled Prompt"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>by {prompt.creator}</span>
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
            <span>Used {prompt.usage_count} times</span>
            {prompt.likes && <span>❤️ {prompt.likes}</span>}
            {prompt.generation && (
              <span className="text-blue-400">Gen {prompt.generation}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleUsageIncrement();
                handleCopy();
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Use Prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`/prompt/${prompt.id}?evolve=creative`, "_blank");
              }}
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-700/20"
            >
              🧬 Evolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
