"use client";

import { useEffect, useState } from "react";
import PromptGrid from "@/components/PromptGrid";
import Link from "next/link";
import { useVerification } from "@/contexts/VerificationContext";
import PassportIcon from "@/components/ui/passportIcon";
import Navigation from "@/components/Navigation";
import { Pin } from "lucide-react";

export default function PinnedPage() {
  const { isVerified, nullifierHash } = useVerification();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPinnedPrompts = async () => {
      if (!nullifierHash) return;
      setLoading(true);
      try {
        const res = await fetch("/api/prompts/pinned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nullifier_hash: nullifierHash }),
        });
        const data = await res.json();
        setPrompts(data.prompts || []);
      } catch (err) {
        setError("Failed to load pinned prompts");
      } finally {
        setLoading(false);
      }
    };
    fetchPinnedPrompts();
  }, [nullifierHash]);

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

          {/* World ID Status and Pinned Link */}
          <div className="flex items-center gap-3">
            {isVerified ? (
              <>
                {/* <Link href="/pinned" title="View pinned prompts">
                  <Pin className="h-5 w-5 text-blue-400 hover:text-blue-500 transition-colors" />
                </Link> */}
                <span className="text-sm text-green-400 font-medium">
                  Verified
                </span>
              </>
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
            <p>Loading pinned prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center text-gray-400">
            <p>No pinned prompts yet.</p>
          </div>
        ) : (
          <PromptGrid prompts={prompts} />
        )}
      </main>
    </div>
  );
}
