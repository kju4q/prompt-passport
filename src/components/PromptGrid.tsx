"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptCard from "./PromptCard";
import type { Prompt } from "@/types/prompt";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useVerification } from "@/contexts/VerificationContext";

interface PromptGridProps {
  prompts: Prompt[];
}

export default function PromptGrid({
  prompts: initialPrompts,
}: PromptGridProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  const { nullifierHash } = useVerification();

  useEffect(() => {
    async function fetchPinned() {
      if (!nullifierHash) return;
      const res = await fetch("/api/prompts/pinned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nullifier_hash: nullifierHash }),
      });
      const data = await res.json();
      if (data.prompts && Array.isArray(data.prompts)) {
        setPinnedIds(data.prompts.map((p: any) => Number(p.id)));
      }
    }
    fetchPinned();
  }, [nullifierHash]);

  const handleUsePrompt = async (promptId: string) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt.id === promptId
          ? { ...prompt, usage_count: prompt.usage_count + 1 }
          : prompt
      )
    );
    console.log(`Prompt ${promptId} used - will update in database`);
  };

  const getFilteredPrompts = (category: string) => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          (p.content &&
            p.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (Array.isArray(p.tags) &&
            p.tags.some((tag: string) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )) ||
          (p.creator &&
            p.creator.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (category === "all") return filtered;
    if (category === "trending")
      return filtered.filter((p) => p.usage_count > 30);
    if (category === "recent")
      return filtered
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    return filtered.filter(
      (p) =>
        Array.isArray(p.tags) &&
        p.tags.some((tag: string) =>
          tag.toLowerCase().includes(category.toLowerCase())
        )
    );
  };

  return (
    <div className="space-y-12">
      {/* Simple Header - Dark Theme */}
      <div className="mb-8">
        {/* Search Bar - Dark */}
        <div className="max-w-sm mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-2.5 rounded-full border-0 bg-gray-800/50 backdrop-blur-sm focus:bg-gray-800/70 transition-all shadow-sm text-sm text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Filter Tabs - Dark Theme */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-gray-800/50 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-700/50">
            <TabsTrigger
              value="all"
              className="rounded-full px-4 py-1.5 text-sm text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="rounded-full px-4 py-1.5 text-sm text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-full px-4 py-1.5 text-sm text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="writing"
              className="rounded-full px-4 py-1.5 text-sm text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
            >
              Writing
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="rounded-full px-4 py-1.5 text-sm text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
            >
              Coding
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Results Count - Dark */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500">
            {getFilteredPrompts("all").length} prompts
          </p>
        </div>

        <TabsContent value="all">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {getFilteredPrompts("all").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={handleUsePrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {getFilteredPrompts("trending").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={handleUsePrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {getFilteredPrompts("recent").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={handleUsePrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="writing">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {getFilteredPrompts("writing").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={handleUsePrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coding">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {getFilteredPrompts("coding").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={handleUsePrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State - Dark */}
      {getFilteredPrompts("all").length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-6"></div>
          <h3 className="text-xl font-light text-gray-300 mb-2">
            No prompts found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or browse different categories
          </p>
        </div>
      )}
    </div>
  );
}
