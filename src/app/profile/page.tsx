"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PassportIcon from "@/components/ui/passportIcon";
import BurgerMenu from "@/components/BurgerMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Bookmark, FileText, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    promptsCreated: 0,
    promptsPinned: 0,
    totalUsage: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) {
        setStatsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-4">
              User Profile
            </h1>
            <p className="text-gray-400 mb-8">
              Sign in with World ID to view your profile.
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

  const userAddress = (session.user as any).address;
  const userId = (session.user as any).id;

  // Generate a user-friendly display name from wallet address
  const displayName = userAddress
    ? `User ${userAddress.slice(2, 6).toUpperCase()}`
    : "User";

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
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
              Profile
            </h1>
          </div>

          {/* Create Button */}
          <div>
            <Button
              onClick={() => router.push("/form/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Prompt
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-gray-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                {displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Wallet Address
                  </label>
                  <p className="text-gray-200 font-mono text-sm bg-gray-900/50 px-3 py-2 rounded border border-gray-700/50">
                    {userAddress?.slice(0, 8)}...{userAddress?.slice(-6)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Member Since
                  </label>
                  <p className="text-gray-200 text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white">Verified</Badge>
                <span className="text-sm text-gray-400">World ID Wallet</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
              <Link href="/form/create">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    Create Prompt
                  </h3>
                  <p className="text-sm text-gray-400">
                    Submit a new prompt to the community
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
              <Link href="/pinned">
                <CardContent className="p-6 text-center">
                  <Bookmark className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    Pinned Prompts
                  </h3>
                  <p className="text-sm text-gray-400">
                    View your saved prompts
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
              <Link href="/community">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    Community
                  </h3>
                  <p className="text-sm text-gray-400">
                    Browse community prompts
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Stats (placeholder for future) */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-gray-200">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {statsLoading ? "..." : stats.promptsCreated}
                  </div>
                  <div className="text-sm text-gray-400">Prompts Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {statsLoading ? "..." : stats.promptsPinned}
                  </div>
                  <div className="text-sm text-gray-400">Prompts Pinned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {statsLoading ? "..." : stats.totalUsage}
                  </div>
                  <div className="text-sm text-gray-400">Total Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
