"use client";

import Link from "next/link";
import PassportIcon from "@/components/ui/passportIcon";
import BurgerMenu from "@/components/BurgerMenu";
import Footer from "@/components/Footer";
import { Mail, MessageCircle } from "lucide-react";

export default function SupportPage() {
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
              Support
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
              <MessageCircle className="w-16 h-16 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-200">Need Help?</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're here to help you make the most of Prompt Passport
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-200">
                Get in Touch
              </h2>

              <div className="flex justify-center">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 max-w-md">
                  <Mail className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    Email Support
                  </h3>
                  <p className="text-gray-400 mb-4">
                    For questions, feedback, or technical issues
                  </p>
                  <a
                    href="mailto:hello@qendresa.dev"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    hello@qendresa.dev
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-200">
                  How do I create my first prompt?
                </h3>
                <p className="text-gray-400">
                  Click the "Create Prompt" button in the menu, fill in your
                  prompt text, add tags, and submit!
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-200">
                  How do I pin a prompt?
                </h3>
                <p className="text-gray-400">
                  Click the pin icon on any prompt card to save it to your
                  pinned collection.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-200">
                  What is prompt evolution?
                </h3>
                <p className="text-gray-400">
                  Evolution allows you to remix and improve existing prompts to
                  create new variations.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-200">
                  How do I use a prompt with AI models?
                </h3>
                <p className="text-gray-400">
                  Click "Use Prompt" on any prompt card to open it directly in
                  the appropriate AI model.
                </p>
              </div>
            </div>
          </div>

          {/* Back to App */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-200">
                Ready to Continue Creating?
              </h2>
              <p className="text-gray-400">
                Head back to the app and keep exploring the world of AI
                creativity.
              </p>
              <div className="pt-4">
                <Link
                  href="/community"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Community
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
