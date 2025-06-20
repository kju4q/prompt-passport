"use client";

import { useState, useEffect } from "react";
import PromptGrid from "@/components/PromptGrid";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PassportIcon from "@/components/ui/passportIcon";
import BurgerMenu from "@/components/BurgerMenu";
import { Pin } from "lucide-react";

export default function CommunityPage() {
  const { data: session } = useSession();
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

          {/* Right Side - Status and Pin */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <span className="text-sm text-green-400 font-medium">
                Signed In
              </span>
            ) : (
              <span className="text-sm text-gray-400 font-medium">
                Guest Mode
              </span>
            )}
            <Link
              href="/pinned"
              title="View pinned prompts"
              className="flex items-center transition-colors hover:text-white text-gray-400"
            >
              <Pin className="h-4 w-4 text-blue-400" />
            </Link>
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
