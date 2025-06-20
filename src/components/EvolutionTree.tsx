// components/EvolutionTree.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreePine, Copy, Heart, Zap } from "lucide-react";

interface EvolutionTreeProps {
  prompt: any;
  evolutionTree: any[];
  evolutionResult: string;
  evolveType: string | null;
  onSaveEvolution: () => void;
  onTryAgain: () => void;
  promptId: string;
  router: any;
  setEvolutionResult: (value: string) => void;
  setEvolutionProgress: (value: number) => void;
}

export default function EvolutionTree({
  prompt,
  evolutionTree,
  evolutionResult,
  evolveType,
  onSaveEvolution,
  onTryAgain,
  promptId,
  router,
  setEvolutionResult,
  setEvolutionProgress,
}: EvolutionTreeProps) {
  const [viewMode, setViewMode] = useState("tree");
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  // Simple toast notification
  const showToast = (message: string, type: "success" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add this helper function to format creator names
  const formatCreatorName = (creator: string) => {
    if (!creator) return "Unknown";
    if (creator.startsWith("0x")) {
      return `User ${creator.slice(2, 6).toUpperCase()}`;
    }
    return creator;
  };

  // Build tree structure with real parent-child relationships
  // Update this function in your components/EvolutionTree.tsx
  // Replace the existing buildTreeStructure function with this:

  const buildTreeStructure = () => {
    if (!prompt) return;

    console.log("Building tree with prompt:", prompt); // Debug log
    console.log("Evolution tree data:", evolutionTree); // Debug log

    // Create nodes map
    const nodesMap = new Map();

    // Add root node - using your actual Supabase field names
    const rootNode = {
      id: prompt.id,
      content: prompt.text, // Always use the original prompt's text
      title: prompt.title || null,
      creator: prompt.created_by || prompt.creator, // Your field is 'created_by'
      generation: 0,
      remix_type: "original",
      likes: prompt.likes || 0,
      usage_count: prompt.usage_count || 0,
      created_at: prompt.created_at,
      parent_id: null,
      children: [],
      level: 0,
    };
    nodesMap.set(prompt.id, rootNode);

    // Add evolution nodes - using your actual Supabase field names
    evolutionTree.forEach((evolution) => {
      console.log("Processing evolution:", evolution); // Debug log

      const node = {
        id: evolution.id,
        content: evolution.text || evolution.content, // Your field is 'text'
        title:
          evolution.title ||
          `${evolution.remix_type || "Evolution"} by ${evolution.created_by}`,
        creator: evolution.created_by || evolution.creator, // Your field is 'created_by'
        generation: evolution.generation || 1,
        remix_type: determineRemixType(evolution), // We'll create this helper function
        likes: evolution.likes || 0,
        usage_count: evolution.usage_count || 0,
        created_at: evolution.created_at,
        parent_id: evolution.parent_id,
        children: [],
        level: evolution.generation || 1,
      };
      nodesMap.set(evolution.id, node);
    });

    // Add pending evolution
    if (evolutionResult) {
      const pendingNode = {
        id: "pending",
        content: evolutionResult,
        title: `${evolveType} Evolution`,
        creator: "You",
        generation: (prompt.generation || 0) + 1,
        remix_type: evolveType || "",
        likes: 0,
        usage_count: 0,
        created_at: new Date().toISOString(),
        parent_id: prompt.id,
        children: [],
        level: 1,
      };
      // Do NOT add pendingNode to nodesMap or tree until saved
    }

    // Build parent-child relationships
    nodesMap.forEach((node) => {
      if (node.parent_id && nodesMap.has(node.parent_id)) {
        const parent = nodesMap.get(node.parent_id);
        parent.children.push(node);
      }
    });

    // Convert to tree structure
    const tree = Array.from(nodesMap.values()).filter(
      (node) => !node.parent_id
    );
    console.log("Final tree structure:", tree); // Debug log
    setTreeData(tree);
  };

  // Add this helper function to determine remix type from your data
  // Add this INSIDE your EvolutionTree component, before the buildTreeStructure function
  const determineRemixType = (evolution: any): string => {
    // If you have remix_type field in your database, use it
    if (evolution.remix_type) {
      return evolution.remix_type;
    }

    // Check if tags contain remix type
    if (evolution.tags && Array.isArray(evolution.tags)) {
      const remixTypes = ["creative", "professional", "detailed"];
      for (const type of remixTypes) {
        if (evolution.tags.includes(type)) {
          return type;
        }
      }
    }

    // Check source_tag for remix type
    if (evolution.source_tag) {
      const sourceTag = evolution.source_tag.toLowerCase();
      if (sourceTag.includes("creative")) return "creative";
      if (sourceTag.includes("professional")) return "professional";
      if (sourceTag.includes("detailed")) return "detailed";
    }

    // Check model_tag as fallback
    if (evolution.model_tag) {
      const modelTag = evolution.model_tag.toLowerCase();
      if (modelTag.includes("creative")) return "creative";
      if (modelTag.includes("professional")) return "professional";
      if (modelTag.includes("detailed")) return "detailed";
    }

    // Default fallback - try to guess from the evolveType passed from parent
    return evolveType || "evolution";
  };
  useEffect(() => {
    buildTreeStructure();
  }, [prompt, evolutionTree, evolutionResult]);

  // DNA-Inspired Tree View
  const TreeView = () => {
    const DNAHelixOriginal = ({ node }: { node: any }) => {
      return (
        <div className="flex flex-col items-center mb-8 px-4">
          {/* Simple DNA Helix */}
          <div className="relative w-12 h-16 mb-4">
            <div className="absolute inset-0 flex justify-center">
              <div className="relative w-8 h-full">
                <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-400 rounded-full opacity-70 transform rotate-12"></div>
                <div className="absolute right-0 top-0 w-0.5 h-full bg-gray-400 rounded-full opacity-70 transform -rotate-12"></div>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 transform -translate-x-1/2 w-4 h-px bg-gray-500 rounded-full opacity-50"
                    style={{
                      top: `${i * 20 + 10}%`,
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Original Prompt Card */}
          <div
            className="relative group cursor-pointer w-full max-w-sm"
            onClick={() => setSelectedNode(node.id)}
          >
            <div
              className={`
              bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 
              transition-all duration-300 relative overflow-hidden
              ${
                selectedNode === node.id
                  ? "ring-2 ring-gray-500 scale-105"
                  : "hover:scale-102 hover:border-gray-600"
              }
            `}
            >
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-full px-3 py-1">
                  <div className="text-base">🧬</div>
                  <Badge
                    variant="outline"
                    className="border-gray-500 text-gray-300 text-xs font-medium"
                  >
                    Original
                  </Badge>
                </div>
              </div>

              {node.title && (
                <h1 className="text-lg font-semibold text-white text-center mb-3">
                  {node.title}
                </h1>
              )}

              <div className="text-center mb-3">
                <p className="text-gray-200 leading-relaxed text-sm line-clamp-3">
                  "{node.content}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {node.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {node.usage_count}
                </span>
                <span>@{formatCreatorName(node.creator)}</span>
              </div>

              {/* Evolution buttons for original prompt */}
              <div className="flex items-center gap-1 mt-2 justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(node.content);
                    showToast("Prompt copied to clipboard!", "success");
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating creative evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=creative&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  C
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating professional evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=professional&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  P
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating detailed evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=detailed&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  D
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Opening for manual edit...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=manual&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  E
                </Button>
              </div>
            </div>
          </div>

          {node.children && node.children.length > 0 && (
            <div className="mt-4 text-center">
              <div className="text-gray-500 text-xs mb-2">Evolutions</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {node.children.map((child: any, index: any) => (
                  <div key={child.id} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    <span className="text-xs text-gray-500 capitalize">
                      {child.remix_type}
                    </span>
                    {index < node.children.length - 1 && (
                      <span className="text-gray-600 mx-1">•</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    const EvolutionNode = ({
      node,
      angle,
      distance,
      parentX = 0,
      parentY = 0,
    }: {
      node: any;
      angle: any;
      distance: any;
      parentX?: any;
      parentY?: any;
    }) => {
      const isSelected = selectedNode === node.id;

      // Adjust positioning for better mobile experience
      const x = parentX + Math.cos(angle) * distance;
      const y = parentY + Math.sin(angle) * distance;

      return (
        <div
          className="absolute transition-all duration-500 group cursor-pointer"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `${y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: isSelected ? 10 : 1,
          }}
          onClick={() => setSelectedNode(node.id)}
        >
          <svg
            className="absolute pointer-events-none"
            style={{
              left: `calc(-${x}px - 8px)`,
              top: `calc(-${y}px - 8px)`,
              width: Math.abs(x) + 16,
              height: Math.abs(y) + 16,
            }}
          >
            <line
              x1={Math.abs(x)}
              y1={Math.abs(y)}
              x2="8"
              y2="8"
              stroke="#6b7280"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
              className="animate-pulse"
            />
          </svg>

          <div
            className={`
            relative bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border transition-all duration-300 w-64 sm:w-72
            ${
              isSelected
                ? "ring-2 ring-gray-500 scale-105"
                : "hover:scale-105 hover:border-gray-600"
            }
          `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-base">
                  {node.remix_type === "creative"
                    ? "🎨"
                    : node.remix_type === "professional"
                    ? "💼"
                    : node.remix_type === "detailed"
                    ? "🔍"
                    : "🧬"}
                </div>
                <Badge
                  variant="outline"
                  className="border-gray-500 text-gray-400 text-xs"
                >
                  Gen {node.generation}
                </Badge>
              </div>

              <Badge
                variant="outline"
                className="border-gray-600 text-gray-400 text-xs capitalize"
              >
                {node.remix_type}
              </Badge>
            </div>

            <div className="mb-3">
              <p className="text-gray-200 leading-relaxed text-sm line-clamp-3">
                "{node.content}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {node.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {node.usage_count}
                </span>
                <span>@{formatCreatorName(node.creator)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(node.content);
                    showToast("Prompt copied to clipboard!", "success");
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating creative evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=creative&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  C
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating professional evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=professional&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  P
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Creating detailed evolution...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=detailed&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  D
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Opening for manual edit...", "info");
                    router.push(
                      `/prompt/${promptId}?evolve=manual&parent=${node.id}`
                    );
                  }}
                  className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                >
                  E
                </Button>
              </div>
            </div>
          </div>

          {node.children &&
            node.children.map((child: any, index: any) => {
              const childAngle =
                angle +
                (index - (node.children.length - 1) / 2) * (Math.PI / 4);
              const childDistance = 160; // Fixed distance for better mobile experience
              return (
                <EvolutionNode
                  key={child.id}
                  node={child}
                  angle={childAngle}
                  distance={childDistance}
                  parentX={x}
                  parentY={y}
                />
              );
            })}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            🧬 Evolution Tree
          </h2>
          <p className="text-gray-400 text-sm">
            Watch how your prompt evolves through user creativity
          </p>
        </div>

        <div className="relative bg-gray-800/20 rounded-xl p-4 sm:p-8 border border-gray-700/30 overflow-hidden min-h-[600px] sm:min-h-[800px]">
          <div className="absolute inset-0 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.3) 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative z-10">
            {treeData.map((rootNode: any, index: any) => (
              <div key={rootNode.id} className="relative">
                <DNAHelixOriginal node={rootNode} />

                <div
                  className="relative"
                  style={{
                    height:
                      typeof window !== "undefined" && window.innerWidth < 768
                        ? "400px"
                        : "600px",
                  }}
                >
                  {rootNode.children &&
                    rootNode.children.map((child: any, index: any) => {
                      const angle =
                        (Math.PI / 3) *
                        (index - (rootNode.children.length - 1) / 2);
                      const distance =
                        typeof window !== "undefined" && window.innerWidth < 768
                          ? 200
                          : 300;
                      return (
                        <EvolutionNode
                          key={child.id}
                          node={child}
                          angle={angle}
                          distance={distance}
                          parentX={0}
                          parentY={150}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Lab View Component
  const LabView = () => {
    const [commits, setCommits] = useState<any[]>([]);

    useEffect(() => {
      const buildTimeline = () => {
        if (!prompt) return [];

        const timelineEvents = [
          {
            id: prompt.id,
            type: "creation",
            content: prompt.text || prompt.content,
            title: prompt.title || "Original prompt created",
            creator: prompt.creator,
            timestamp: prompt.created_at || new Date().toISOString(),
            generation: 0,
            remix_type: "original",
            likes: prompt.likes || 0,
            usage_count: prompt.usage_count || 0,
            event: "created",
          },
        ];

        evolutionTree.forEach((evolution) => {
          timelineEvents.push({
            ...evolution,
            type: "evolution",
            timestamp: evolution.created_at || new Date().toISOString(),
            title:
              evolution.title ||
              `${evolution.remix_type} evolution by ${evolution.creator}`,
            event: "evolved",
          });
        });

        if (evolutionResult) {
          timelineEvents.push({
            id: "pending",
            type: "pending",
            content: evolutionResult,
            title: `${evolveType} evolution in progress`,
            creator: "You",
            timestamp: new Date().toISOString(),
            generation: (prompt.generation || 0) + 1,
            remix_type: evolveType || "",
            likes: 0,
            usage_count: 0,
            event: "evolving",
          });
        }

        return timelineEvents.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      };

      setCommits(buildTimeline());
    }, [prompt, evolutionTree, evolutionResult, evolveType]);

    const LabStats = () => {
      const totalLikes = commits.reduce((sum, c) => sum + (c.likes || 0), 0);
      const totalUses = commits.reduce(
        (sum, c) => sum + (c.usage_count || 0),
        0
      );
      const contributors = [...new Set(commits.map((c) => c.creator))];

      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              label: "Generations",
              value: commits.length,
              icon: "🧬",
              color: "text-blue-400",
            },
            {
              label: "Creators",
              value: contributors.length,
              icon: "👥",
              color: "text-green-400",
            },
            {
              label: "Impact",
              value: Math.round(
                (totalLikes + totalUses) / Math.max(commits.length, 1)
              ),
              icon: "⚡",
              color: "text-yellow-400",
            },
            {
              label: "Rate",
              value: "N/A",
              icon: "📈",
              color: "text-purple-400",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="text-center px-4">
          <h1 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <span className="text-2xl">🔬</span>
            Evolution Laboratory
          </h1>
          <p className="text-gray-400 text-sm">
            Analyze evolution patterns and track contributions
          </p>
        </div>

        <LabStats />

        <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">📜</span>
            Evolution Timeline ({commits.length} events)
          </h2>

          <div className="space-y-4">
            {commits.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                  <span className="text-sm">
                    {event.event === "created"
                      ? "🌱"
                      : event.event === "evolved"
                      ? "🧬"
                      : "⚡"}
                  </span>
                </div>
                <div className="flex-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="font-medium text-white text-sm">
                    {event.title}
                  </h4>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    "{event.content}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>@{formatCreatorName(event.creator)}</span>
                      <span>👍 {event.likes}</span>
                      <span>⚡ {event.usage_count}</span>
                    </div>

                    {/* Evolution buttons for each node */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(event.content);
                          showToast("Prompt copied to clipboard!", "success");
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast("Creating creative evolution...", "info");
                          router.push(
                            `/prompt/${promptId}?evolve=creative&parent=${event.id}`
                          );
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                      >
                        C
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(
                            "Creating professional evolution...",
                            "info"
                          );
                          router.push(
                            `/prompt/${promptId}?evolve=professional&parent=${event.id}`
                          );
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                      >
                        P
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast("Creating detailed evolution...", "info");
                          router.push(
                            `/prompt/${promptId}?evolve=detailed&parent=${event.id}`
                          );
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                      >
                        D
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast("Opening for manual edit...", "info");
                          router.push(
                            `/prompt/${promptId}?evolve=manual&parent=${event.id}`
                          );
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                      >
                        E
                      </Button>
                    </div>
                  </div>
                  {event.isPending && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={onSaveEvolution}
                        className="h-6 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEvolutionResult("");
                          setEvolutionProgress(0);
                          router.replace(`/prompt/${promptId}`);
                        }}
                        className="h-6 text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-900/50 border-t border-gray-800">
      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-200">
            Evolution Tree
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "tree" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="text-xs"
            >
              <TreePine className="w-3 h-3 mr-1" />
              Tree View
            </Button>
            <Button
              variant={viewMode === "lab" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("lab")}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Lab View
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Container - Responsive layout */}
      <div className="w-full">
        {viewMode === "tree" ? (
          /* Tree View - needs horizontal scrolling for the DNA helix layout */
          <div className="w-full overflow-auto">
            <div className="min-w-[800px] min-h-[600px] relative p-4 sm:p-8">
              <TreeView />
            </div>
          </div>
        ) : (
          /* Lab View - mobile-friendly timeline layout */
          <div className="w-full px-4 sm:px-8">
            <LabView />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`
            px-4 py-2 rounded-lg text-sm font-medium shadow-lg
            ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }
          `}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
