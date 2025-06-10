"use client";

import PromptGrid from "@/components/PromptGrid";
import { Heart } from "lucide-react";
import PassportIcon from "@/components/ui/passportIcon";
import WorldIDButton from "@/components/WorldIDButton";
import Link from "next/link";

export default function HomePage() {
  const isLoggedIn = false; // Replace with actual World ID state
  const userId = "anon389"; // Replace with actual user info

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - Dark Theme */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 backdrop-blur-md bg-gray-900/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <PassportIcon size="medium" />
            </div>
          </div>

          {/* Center Title */}
          <div className="flex items-center gap-6">
            <h1 className="text-base font-medium text-gray-300 tracking-wide">
              For you
            </h1>
            <Link
              href="/tiktok"
              className="text-base font-medium text-gray-500 hover:text-gray-300 tracking-wide transition-colors"
            >
              TikTok
            </Link>
          </div>

          {/* World ID Status */}
          <div>
            {isLoggedIn ? (
              <span className="text-sm text-green-400 font-medium">
                {userId}
              </span>
            ) : (
              <WorldIDButton />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <PromptGrid />
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
