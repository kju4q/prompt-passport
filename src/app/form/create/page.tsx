"use client";

import PromptForm from "../PromptForm";
import PassportIcon from "@/components/ui/passportIcon";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CreatePromptPage() {
  const { data: session, status } = useSession();

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

          {/* Center Title */}
          <div className="flex items-center gap-6">
            <h1 className="text-base font-medium text-gray-300 tracking-wide">
              Create Prompt
            </h1>
          </div>

          {/* Auth Status */}
          <div>
            {status === "loading" ? (
              <span className="text-sm text-gray-400 font-medium">
                Loading...
              </span>
            ) : session?.user ? (
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
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-medium text-gray-200 mb-6">
            Submit a Prompt
          </h2>
          <PromptForm />
        </div>
      </main>
    </div>
  );
}
