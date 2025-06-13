"use client";

import { useState, useEffect } from "react";
import PromptGrid from "@/components/PromptGrid";
import Link from "next/link";
import { useVerification } from "@/contexts/VerificationContext";
import PassportIcon from "@/components/ui/passportIcon";
import Navigation from "@/components/Navigation";

export default function CommunityPage() {
  const { isVerified } = useVerification();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch("/api/prompts/community");
        if (!response.ok) {
          throw new Error("Failed to fetch community prompts");
        }
        const data = await response.json();
        setPrompts(data.prompts);
      } catch (err) {
        console.error("Error fetching community prompts:", err);
        setError("Failed to load community prompts");
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
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
        {error ? (
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">
            <p>Loading community prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center text-gray-400">
            <p>No community prompts yet. Be the first to submit one!</p>
          </div>
        ) : (
          <PromptGrid prompts={prompts} />
        )}
      </main>
    </div>
  );
}
