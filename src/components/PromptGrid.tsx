"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptCard from "./PromptCard";
import type { Prompt } from "@/types/prompt";
import { Search, Filter, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

// Enhanced mock data for demo
const mockPrompts: Prompt[] = [
  {
    id: "1",
    content:
      "You are a world-class copywriter. Write a compelling product description for [PRODUCT] that focuses on benefits over features. Use emotional triggers and end with a strong call-to-action.",
    source: "Community",
    creator: "Sarah Chen",
    usage_count: 47,
    tags: ["copywriting", "marketing", "conversion"],
    created_at: "2025-05-20T10:30:00Z",
  },
  {
    id: "2",
    content:
      "Act as a senior software architect. Review this code and provide specific suggestions for improving performance, maintainability, and security. Focus on actionable recommendations.",
    source: "GitHub",
    creator: "Alex Kumar",
    usage_count: 89,
    tags: ["coding", "review", "architecture"],
    created_at: "2025-05-22T14:15:00Z",
  },
  {
    id: "3",
    content:
      "You are a creative writing coach. Help me brainstorm 10 unique plot twists for a mystery novel set in [SETTING]. Each twist should be unexpected but logical when revealed.",
    source: "Twitter",
    creator: "Emma Rodriguez",
    usage_count: 23,
    tags: ["creative writing", "storytelling", "mystery"],
    created_at: "2025-05-23T09:45:00Z",
  },
  {
    id: "4",
    content:
      "Design a comprehensive user onboarding flow for [APP TYPE]. Include welcome messages, feature highlights, and progressive disclosure. Focus on reducing time-to-value.",
    source: "Manual",
    creator: "David Park",
    usage_count: 34,
    tags: ["ux design", "onboarding", "product"],
    created_at: "2025-05-24T16:20:00Z",
  },
  {
    id: "5",
    content:
      "You are a data analyst. Analyze this dataset and provide 3 key insights with supporting visualizations. Explain your methodology and suggest actionable next steps.",
    source: "Community",
    creator: "Lisa Wang",
    usage_count: 56,
    tags: ["data analysis", "insights", "visualization"],
    created_at: "2025-05-25T11:10:00Z",
  },
  {
    id: "6",
    content:
      "Create a social media content calendar for [BRAND] focusing on [INDUSTRY]. Include post types, optimal timing, and engagement strategies for each platform.",
    source: "TikTok",
    creator: "Marcus Johnson",
    usage_count: 28,
    tags: ["social media", "content strategy", "marketing"],
    created_at: "2025-05-26T13:30:00Z",
  },
  {
    id: "7",
    content:
      "You are a meditation guide. Create a 5-minute mindfulness exercise for reducing work stress. Use calming language and include breathing instructions.",
    source: "Community",
    creator: "Zen Master Ko",
    usage_count: 12,
    tags: ["wellness", "mindfulness", "stress relief"],
    created_at: "2025-05-27T08:00:00Z",
  },
  {
    id: "8",
    content:
      "Act as a financial advisor. Explain cryptocurrency investing to a complete beginner. Cover risks, benefits, and practical first steps. Keep it simple and actionable.",
    source: "Manual",
    creator: "Crypto Carl",
    usage_count: 67,
    tags: ["finance", "crypto", "investing"],
    created_at: "2025-05-27T16:45:00Z",
  },
  {
    id: "9",
    content:
      "Help me write a heartfelt letter to my future self. Include questions about growth, dreams achieved, and lessons learned. Make it personal and inspiring.",
    source: "Community",
    creator: "Maya Patel",
    usage_count: 19,
    tags: ["personal growth", "reflection", "journaling"],
    created_at: "2025-05-27T20:15:00Z",
  },
  {
    id: "10",
    content:
      "You are a plant care expert. Diagnose what might be wrong with my [PLANT TYPE] based on these symptoms. Provide step-by-step care instructions.",
    source: "Manual",
    creator: "Green Thumb",
    usage_count: 31,
    tags: ["plants", "gardening", "care"],
    created_at: "2025-05-28T07:30:00Z",
  },
];

export default function PromptGrid() {
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
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

  const getFilteredPrompts = (category: string) => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag) =>
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
      p.tags.some((tag) => tag.toLowerCase().includes(category.toLowerCase()))
    );
  };

  if (loading) {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="break-inside-avoid mb-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-4 w-1/3"></div>
              <div className="h-32 bg-gray-100 rounded mb-4"></div>
              <div className="h-6 bg-gray-100 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section - Clean and Minimal */}
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-light text-gray-800 tracking-tight">
            Discover Prompts
          </h1>
          <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            A curated collection of AI prompts from creators around the world
          </p>
        </div>

        {/* Search Bar - Pinterest Style */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 rounded-full border-gray-200 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs - Minimal Design */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center mb-12">
          <TabsList className="bg-gray-50 p-1 rounded-full">
            <TabsTrigger
              value="all"
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="writing"
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              Writing
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              Coding
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 font-medium">
            {getFilteredPrompts("all").length} prompts found
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

      {/* Empty State */}
      {getFilteredPrompts("all").length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-xl font-light text-gray-600 mb-2">
            No prompts found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search or browse different categories
          </p>
        </div>
      )}
    </div>
  );
}
