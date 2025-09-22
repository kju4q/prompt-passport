"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromptGrid from "@/components/PromptGrid";
import PassportIcon from "@/components/ui/passportIcon";
import WorldIDButton from "@/components/WorldIDButton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BurgerMenu from "@/components/BurgerMenu";
import Footer from "@/components/Footer";
import type { Prompt } from "@/types/prompt";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setError(null);
      setRequiresAuth(false);
      try {
        const res = await fetch("/api/generatePrompts", { method: "POST" });
        if (res.status === 401) {
          setRequiresAuth(true);
          setPrompts([]);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch prompts");
        const data = await res.json();
        setPrompts(data.prompts);
      } catch (err) {
        setError("Failed to load prompts");
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

          {/* Center Title */}
          <div className="flex items-center gap-6">
            <h1 className="text-base font-medium text-gray-300 tracking-wide">
              Feed
            </h1>
          </div>

          {/* Right Side - Status */}
          <div>
            {session?.user ? (
              <span className="text-sm text-green-400 font-medium">
                Signed In
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
        {requiresAuth ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center text-gray-300">
            <p className="text-lg font-medium">Sign in to fetch fresh prompts.</p>
            <p className="text-sm text-gray-400 max-w-md">
              Cached prompts expired. Connect with World ID to generate a new batch and keep exploring the feed.
            </p>
            <WorldIDButton />
          </div>
        ) : error ? (
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">
            <p>Loading prompts...</p>
          </div>
        ) : (
          <PromptGrid prompts={prompts} />
        )}
      </main>

      {/* Footer - Dark */}
      <Footer />
    </div>
  );
}
