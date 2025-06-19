"use client";

import { useState, useEffect } from "react";
import PromptGrid from "@/components/PromptGrid";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PassportIcon from "@/components/ui/passportIcon";
import Navigation from "@/components/Navigation";
import { Pin } from "lucide-react";

export default function PinnedPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPinnedPrompts = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/prompts/pinned", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pinned prompts");
        }

        const data = await response.json();
        setPrompts(data.prompts);
      } catch (err) {
        console.error("Error fetching pinned prompts:", err);
        setError("Failed to load pinned prompts");
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedPrompts();
  }, [session]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <Pin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-4">
              Your Pinned Prompts
            </h1>
            <p className="text-gray-400 mb-8">
              Sign in with World ID to view your pinned prompts.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Pin className="w-6 h-6 text-yellow-400" />
          <h1 className="text-3xl font-bold text-gray-200">
            Your Pinned Prompts
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-400">Loading your pinned prompts...</div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-16">
            <Pin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              No Pinned Prompts Yet
            </h2>
            <p className="text-gray-400 mb-6">
              Pin prompts you like to find them here later.
            </p>
            <Link
              href="/feed"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Prompts
            </Link>
          </div>
        ) : (
          <PromptGrid prompts={prompts} />
        )}
      </div>
    </div>
  );
}
