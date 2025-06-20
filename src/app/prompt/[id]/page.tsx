"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PromptCard from "@/components/PromptCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PassportIcon from "@/components/ui/passportIcon";
import BurgerMenu from "@/components/BurgerMenu";
import { use } from "react";
import { TreePine, Copy, Heart, Zap } from "lucide-react";
import EvolutionTree from "@/components/EvolutionTree";

export default function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const evolveType = searchParams.get("evolve");
  const parentId = searchParams.get("parent");
  const [viewMode, setViewMode] = useState("tree");
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState([]);

  // Evolution states
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [evolutionResult, setEvolutionResult] = useState<string>("");
  const [evolutionTree, setEvolutionTree] = useState<any[]>([]);

  // Unwrap params using React.use with proper type casting
  const unwrappedParams = use(params);
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
    console.log("Evolution useEffect triggered:", {
      evolveType,
      parentId,
      prompt,
    });
    if (evolveType && prompt && !isEvolving && !evolutionResult) {
      // Set loading state immediately
      setIsEvolving(true);
      setEvolutionProgress(0);
      startEvolution(evolveType);
    }
  }, [evolveType, prompt, parentId]);

  const loadEvolutionTree = async (rootPrompt: any) => {
    try {
      console.log("Loading evolution tree for prompt:", rootPrompt.id);
      const res = await fetch(
        `/api/prompts/evolution-tree?id=${rootPrompt.id}`
      );
      const data = await res.json();
      console.log("Evolution tree data received:", data);
      setEvolutionTree(data.tree || []);
    } catch (err) {
      console.error("Failed to load evolution tree:", err);
    }
  };

  const startEvolution = async (remixType: string) => {
    // Loading state is already set by the useEffect

    console.log("Starting evolution with:", { remixType, parentId, promptId });

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
          parentId: parentId || prompt.id,
        }),
      });

      const result = await response.json();
      console.log("Remix result:", result);

      // Handle manual editing
      if (result.isManual) {
        setEvolutionResult(result.remixedPrompt);
        setEvolutionProgress(100);
        clearInterval(progressInterval);
        setIsEvolving(false);
        return; // Don't save immediately for manual editing
      }

      setEvolutionResult(result.remixedPrompt);
      setEvolutionProgress(100);

      // Immediately save the evolution to the database
      const saveResponse = await fetch("/api/prompts/save-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: result.remixedPrompt,
          parentId: parentId || prompt.id,
          remixType: remixType,
          generation: (prompt.generation || 0) + 1,
        }),
      });

      console.log("Save response status:", saveResponse.status);

      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        console.log("Save result:", saveResult);

        toast.success("Evolution saved to community!");
        setEvolutionResult("");
        setEvolutionProgress(0);
        // Remove evolve param from URL but keep the original prompt ID
        router.replace(`/prompt/${promptId}`);
        // Reload tree after a short delay to ensure database is updated
        setTimeout(() => {
          console.log("Reloading evolution tree...");
          loadEvolutionTree(prompt);
        }, 1000); // Increased delay to ensure database is updated
      } else {
        const errorText = await saveResponse.text();
        console.error("Save failed:", errorText);
        toast.error("Failed to save evolution");
      }
    } catch (error) {
      console.error("Evolution failed:", error);
      toast.error("Evolution failed");
    } finally {
      setIsEvolving(false);
      clearInterval(progressInterval);
    }
  };

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
              Evolution Tree
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
              <PromptCard prompt={prompt} showFullContent={true} />
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
                    {evolveType === "manual"
                      ? "✏️ Edit Your Prompt"
                      : "✨ New Evolution Created"}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 text-purple-400"
                  >
                    {evolveType === "manual"
                      ? "Manual Edit"
                      : `${evolveType} Style`}
                  </Badge>
                </div>

                {evolveType === "manual" ? (
                  <div className="space-y-4">
                    <textarea
                      value={evolutionResult}
                      onChange={(e) => setEvolutionResult(e.target.value)}
                      className="w-full h-32 bg-gray-800/50 rounded-lg p-4 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Edit your prompt here..."
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          // Save the manually edited prompt
                          const saveResponse = await fetch(
                            "/api/prompts/save-evolution",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                content: evolutionResult,
                                parentId: parentId || prompt.id,
                                remixType: "manual",
                                generation: (prompt.generation || 0) + 1,
                              }),
                            }
                          );
                          if (saveResponse.ok) {
                            toast.success(
                              "Manual evolution saved to community!"
                            );
                            setEvolutionResult("");
                            setEvolutionProgress(0);
                            router.replace(`/prompt/${promptId}`);
                            // Reload tree after a short delay to ensure database is updated
                            setTimeout(() => {
                              loadEvolutionTree(prompt);
                            }, 500);
                          } else {
                            toast.error("Failed to save manual evolution");
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save Evolution
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
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-200 leading-relaxed">
                        "{evolutionResult}"
                      </p>
                    </div>

                    <div className="flex gap-3">
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
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Evolution Tree - full width, outside main */}
      {(evolutionTree.length > 0 || evolutionResult) && (
        <div className="w-full max-w-full px-0 overflow-x-auto">
          <EvolutionTree
            prompt={prompt}
            evolutionTree={evolutionTree}
            evolutionResult={evolutionResult}
            evolveType={evolveType}
            onTryAgain={() => {
              setEvolutionResult("");
              setEvolutionProgress(0);
              router.replace(`/prompt/${promptId}`);
            }}
            onSaveEvolution={() => {}}
            promptId={promptId}
            router={router}
            setEvolutionResult={setEvolutionResult}
            setEvolutionProgress={setEvolutionProgress}
          />
        </div>
      )}
    </div>
  );
}
