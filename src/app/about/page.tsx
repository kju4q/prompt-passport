"use client";

import Link from "next/link";
import PassportIcon from "@/components/ui/passportIcon";
import BurgerMenu from "@/components/BurgerMenu";
import Footer from "@/components/Footer";
import { Sparkles, Users, Globe } from "lucide-react";

export default function AboutPage() {
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
              About
            </h1>
          </div>

          {/* Right Side - Empty for balance */}
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <PassportIcon size="large" />
            </div>
            <h1 className="text-4xl font-bold text-gray-200">
              Welcome to Prompt Passport
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your journey through AI creativity starts here
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-2xl font-semibold">
                  Why Prompt Passport Exists
                </h2>
              </div>

              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  In a world where AI is transforming how we create, Prompt
                  Passport serves as your
                  <span className="text-emerald-400 font-medium">
                    {" "}
                    creative companion
                  </span>{" "}
                  and
                  <span className="text-blue-400 font-medium">
                    {" "}
                    inspiration hub
                  </span>
                  .
                </p>

                <p>
                  We believe that the best prompts come from real creators
                  sharing their discoveries. That's why we've built a space
                  where you can discover, save, and evolve prompts that spark
                  your imagination.
                </p>

                <p>
                  Whether you're a writer, designer, developer, or just curious
                  about AI, Prompt Passport helps you navigate the vast
                  landscape of AI creativity with confidence and community.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-400">
                Share and discover prompts from creators around the world
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                AI Evolution
              </h3>
              <p className="text-gray-400">
                Evolve and remix prompts to create something entirely new
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
              <Globe className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Global Access
              </h3>
              <p className="text-gray-400">
                Access your favorite prompts from anywhere, anytime
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-200">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-400">
                Join our community of creators and discover the power of
                AI-assisted creativity.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link
                  href="/community"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Community
                </Link>
                <Link
                  href="/form/create"
                  className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Create Your First Prompt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
