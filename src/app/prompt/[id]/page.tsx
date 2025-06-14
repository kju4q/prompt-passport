"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PromptCard from "@/components/PromptCard";
import Link from "next/link";
import { useVerification } from "@/contexts/VerificationContext";
import PassportIcon from "@/components/ui/passportIcon";
import Navigation from "@/components/Navigation";
import { use } from "react";

export default function PromptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isVerified } = useVerification();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const evolveType = searchParams.get("evolve");

  // Evolution states
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [evolutionResult, setEvolutionResult] = useState<string>("");
  const [evolutionTree, setEvolutionTree] = useState<any[]>([]);

  // Unwrap params using React.use with proper type casting
  const unwrappedParams = use(params as unknown as Promise<{ id: string }>);
  const promptId = unwrappedParams.id;

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/detail?id=${promptId}`);
        const data = await res.json();
        if (data.prompt) {
          setPrompt(data.prompt);
          // Load evolution tree
          loadEvolutionTree(data.prompt);
        } else {
          setError("Prompt not found");
        }
      } catch (err) {
        setError("Failed to load prompt");
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [promptId]);

  // Start evolution if evolveType is present
  useEffect(() => {
    if (evolveType && prompt && !isEvolving && !evolutionResult) {
      startEvolution(evolveType);
    }
  }, [evolveType, prompt]);

  const loadEvolutionTree = async (rootPrompt: any) => {
    try {
      const res = await fetch(
        `/api/prompts/evolution-tree?id=${rootPrompt.id}`
      );
      const data = await res.json();
      setEvolutionTree(data.tree || []);
    } catch (err) {
      console.error("Failed to load evolution tree:", err);
    }
  };

  const startEvolution = async (remixType: string) => {
    setIsEvolving(true);
    setEvolutionProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setEvolutionProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      const response = await fetch("/api/prompts/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: prompt.text || prompt.content,
          remixType: remixType,
          parentId: prompt.id,
        }),
      });

      const result = await response.json();
      setEvolutionResult(result.remixedPrompt);
      setEvolutionProgress(100);

      toast.success("Evolution complete!");

      // Reload evolution tree to show new evolution
      setTimeout(() => {
        loadEvolutionTree(prompt);
      }, 1000);
    } catch (error) {
      console.error("Evolution failed:", error);
      toast.error("Evolution failed");
    } finally {
      setIsEvolving(false);
      clearInterval(progressInterval);
    }
  };

  const saveEvolution = async () => {
    if (!evolutionResult) return;

    try {
      const response = await fetch("/api/prompts/save-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: evolutionResult,
          parentId: prompt.id,
          remixType: evolveType,
          generation: (prompt.generation || 0) + 1,
        }),
      });

      if (response.ok) {
        toast.success("Evolution saved to community!");
        // Clear evolution state and reload tree
        setEvolutionResult("");
        setEvolutionProgress(0);
        // Remove evolve param from URL
        router.replace(`/prompt/${promptId}`);
        // Reload tree
        loadEvolutionTree(prompt);
      }
    } catch (error) {
      toast.error("Failed to save evolution");
    }
  };

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
      <main className="max-w-4xl mx-auto px-6 py-16">
        {error ? (
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">
            <p>Loading prompt...</p>
          </div>
        ) : prompt ? (
          <div className="space-y-8">
            {/* Original Prompt */}
            <div>
              <h1 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                🧬 Prompt Evolution Tree
              </h1>
              <PromptCard prompt={prompt} />
            </div>

            {/* Evolution in Progress */}
            {isEvolving && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                  🔬 Evolution in Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      Creating {evolveType} evolution...
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {evolutionProgress}%
                    </span>
                  </div>
                  <Progress value={evolutionProgress} className="h-3" />
                </div>
              </div>
            )}

            {/* Evolution Result */}
            {evolutionResult && (
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-400">
                    ✨ New Evolution Created
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 text-purple-400"
                  >
                    {evolveType} Style
                  </Badge>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-200 leading-relaxed">
                    "{evolutionResult}"
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={saveEvolution}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500"
                  >
                    💾 Save to Community
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEvolutionResult("");
                      setEvolutionProgress(0);
                      router.replace(`/prompt/${promptId}`);
                    }}
                    className="border-gray-600"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Evolution Tree */}
            {evolutionTree.length > 0 && (
              <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-purple-400 mb-6">
                  🌳 Evolution Tree
                </h3>

                <div className="space-y-4">
                  {evolutionTree.map((evolution, index) => (
                    <div key={evolution.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        {index < evolutionTree.length - 1 && (
                          <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 mt-2" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="border-blue-500/40 text-blue-400 text-xs"
                            >
                              Gen {evolution.generation}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-purple-500/40 text-purple-400 text-xs"
                            >
                              {evolution.remix_type}
                            </Badge>
                          </div>

                          <p className="text-gray-200 text-sm italic">
                            "{evolution.content}"
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span>by @{evolution.creator}</span>
                            <span>👍 {evolution.likes || 0}</span>
                            <span>⚡ {evolution.usage_count || 0} uses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
