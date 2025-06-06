"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptCard from "./PromptCard";
import type { Prompt } from "@/types/prompt";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PromptGrid() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/generatePrompts", {
          method: "POST", // or "GET", depending on how your API is written
        });

        if (!res.ok) throw new Error("Failed to fetch prompts");
        const data = await res.json();
        setPrompts(data.prompts); // assuming your API returns { prompts: [...] }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const getFilteredPrompts = (category: string) => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          p.creator.toLowerCase().includes(searchQuery.toLowerCase())
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
    return filtered.filter((p) =>
      p.tags.some((tag: string) =>
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  };

  if (loading) {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="break-inside-avoid mb-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse border border-gray-700/50">
              <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State - Dark */}
      {getFilteredPrompts("all").length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔍</div>
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
