"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import PromptCard, { Prompt } from "./PromptCard";
import { useSession } from "next-auth/react";

interface PromptGridProps {
  prompts: Prompt[];
}

export default function PromptGrid({
  prompts: initialPrompts,
}: PromptGridProps) {
  const { data: session } = useSession();
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);

  useEffect(() => {
    setPrompts(initialPrompts);
  }, [initialPrompts]);

  useEffect(() => {
    async function fetchPinned() {
      if (!session?.user) return;

      try {
        const res = await fetch("/api/prompts/pinned", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.prompts && Array.isArray(data.prompts)) {
          setPinnedIds(data.prompts.map((p: any) => Number(p.id)));
        }
      } catch (error) {
        console.error("Error fetching pinned prompts:", error);
      }
    }
    fetchPinned();
  }, [session]);

  const handlePinPrompt = (promptId: string, pinned: boolean) => {
    // Update local state to reflect pinning changes
    if (pinned) {
      setPinnedIds((prev) => [...prev, Number(promptId)]);
    } else {
      setPinnedIds((prev) => prev.filter((id) => id !== Number(promptId)));
    }
  };

  const getFilteredPrompts = (category: string) => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          (p.content &&
            p.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.text &&
            p.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
    if (category === "popular") {
      return filtered
        .slice()
        .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    }
    if (category === "recent") {
      return filtered
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    return filtered;
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
              value="popular"
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
          </TabsList>
        </div>

        {/* Results Count - Dark */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500">
            {getFilteredPrompts("all").length} prompts
          </p>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredPrompts("all").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onPin={handlePinPrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredPrompts("popular").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onPin={handlePinPrompt}
                isPinned={pinnedIds.includes(Number(prompt.id))}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredPrompts("recent").map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onPin={handlePinPrompt}
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
