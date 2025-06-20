"use client";

import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import { Prompt } from "@/types/prompt";
import PassportIcon from "@/components/ui/passportIcon";
import Link from "next/link";
import { useVerification } from "@/contexts/VerificationContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BurgerMenu from "@/components/BurgerMenu";

const twitterPrompts: Prompt[] = [
  {
    id: "twitter-1",
    content:
      "Create a viral Twitter thread about AI prompt engineering tips. Make it engaging with numbered points, emojis, and actionable advice that developers can implement immediately.",
    source: "twitter",
    creator: "AI",
    usage_count: 234,
    tags: ["thread", "AI", "tips", "viral"],
    created_at: new Date().toISOString(),
  },
  {
    id: "twitter-2",
    content:
      "Generate a Twitter bio for a tech influencer that combines AI expertise, coding skills, and personal branding. Keep it under 160 characters with relevant hashtags.",
    source: "twitter",
    creator: "AI",
    usage_count: 167,
    tags: ["bio", "influencer", "tech", "branding"],
    created_at: new Date().toISOString(),
  },
];

export default function TwitterPage() {
  const { isVerified } = useVerification();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Simulate loading delay like the AI generation
    const loadPrompts = async () => {
      setLoading(true);
      // Simulate loading time (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPrompts(twitterPrompts);
      setLoading(false);
    };

    loadPrompts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - Dark Theme */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 backdrop-blur-md bg-gray-900/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left Side - Burger Menu */}
          <div className="flex items-center gap-4">
            <BurgerMenu />
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <PassportIcon size="medium" />
            </Link>
          </div>

          {/* Center Title */}
          <div className="flex items-center gap-6">
            <h1 className="text-base font-medium text-gray-300 tracking-wide">
              Twitter Prompts
            </h1>
          </div>

          {/* Right Side - Status */}
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

      {/* Coming Soon Blur Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-lg">🚧</span>
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

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
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                showFullContent={true}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer - Dark */}
      <Footer />
    </div>
  );
}
