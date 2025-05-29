import PromptGrid from "@/components/PromptGrid";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Pinterest Style */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-light text-gray-800 tracking-tight">
                    Prompt Passport
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Beta</p>
                </div>
              </div>
            </div>

            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <PromptGrid />
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-100/50 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center gap-2 text-gray-400">
              <span className="font-light">Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <span className="font-light">for creators everywhere</span>
            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-400 font-light">
              <button className="hover:text-gray-600 transition-colors">
                About
              </button>
              <button className="hover:text-gray-600 transition-colors">
                Privacy
              </button>
              <button className="hover:text-gray-600 transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
