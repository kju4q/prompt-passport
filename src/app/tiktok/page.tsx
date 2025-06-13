"use client";

import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import { Prompt } from "@/types/prompt";
import { Heart } from "lucide-react";
import PassportIcon from "@/components/ui/passportIcon";
import Link from "next/link";
import { useVerification } from "@/contexts/VerificationContext";
import Navigation from "@/components/Navigation";

const tiktokPrompts: Prompt[] = [
  {
    id: "tiktok-1",
    content:
      "Create a viral TikTok script where an AI assistant gives brutally honest life advice to a Gen Z creator. Keep it witty, relatable, and loop-worthy.",
    source: "tiktok",
    creator: "AI",
    usage_count: 432,
    tags: ["AI", "scriptwriting", "GenZ", "viral"],
    created_at: new Date().toISOString(),
  },
  {
    id: "tiktok-2",
    content:
      "Design a ChatGPT prompt that generates hyper-aesthetic, dreamy daily routines inspired by TikTok influencers. Include time stamps and mood descriptions.",
    source: "tiktok",
    creator: "AI",
    usage_count: 299,
    tags: ["aesthetic", "wellness", "routine", "influencer"],
    created_at: new Date().toISOString(),
  },
];

export default function TikTokPage() {
  const { isVerified } = useVerification();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Simulate loading delay like the AI generation
    const loadPrompts = async () => {
      setLoading(true);
      // Simulate loading time (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPrompts(tiktokPrompts);
      setLoading(false);
    };

    loadPrompts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - Dark Theme */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 backdrop-blur-md bg-gray-900/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <PassportIcon size="medium" />
            </Link>
          </div>

          {/* Navigation */}
          <Navigation />

          {/* World ID Status */}
          <div>
            {isVerified ? (
              <span className="text-sm text-green-400 font-medium">
                Verified
              </span>
            ) : (
              <span className="text-sm text-gray-400 font-medium">
                Guest Mode
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="break-inside-avoid mb-6">
                <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse border border-gray-700/50">
                  <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
                  <div className="h-32 bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </main>

      {/* Footer - Dark */}
      <footer className="bg-gray-900/60 backdrop-blur-sm border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center gap-2 text-gray-500">
              <span className="font-light">Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <span className="font-light">for creators everywhere</span>
            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-500 font-light">
              <button className="hover:text-gray-300 transition-colors cursor-pointer">
                About
              </button>
              <button className="hover:text-gray-300 transition-colors cursor-pointer">
                Privacy
              </button>
              <button className="hover:text-gray-300 transition-colors cursor-pointer">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
