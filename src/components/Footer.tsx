"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900/60 backdrop-blur-sm border-t border-gray-800 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-2 text-gray-500">
            <span className="font-light">Made with</span>
            <Heart className="h-4 w-4 text-red-400 fill-red-400" />
            <span className="font-light">for creators everywhere</span>
          </div>

          <div className="flex justify-center gap-8 text-sm text-gray-500 font-light">
            <Link
              href="/about"
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              About
            </Link>
            <Link
              href="/support"
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
