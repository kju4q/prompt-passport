"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import WorldIDButton from "@/components/WorldIDButton";
import { useVerification } from "@/contexts/VerificationContext";

export default function LandingPage() {
  const router = useRouter();
  const { isVerified, setVerification } = useVerification();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-100">Prompt Passport</h1>
          <p className="text-xl text-gray-400">
            Your journey through AI creativity starts here. Verify with World ID
            to access the prompt feed and create your own prompts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {!isVerified && (
              <WorldIDButton
                onVerified={(nullifierHash: string) => {
                  console.log(
                    "Verification successful, nullifier hash:",
                    nullifierHash
                  );
                  setVerification(nullifierHash);
                  console.log("Redirecting to /feed...");
                  router.push("/feed");
                }}
              />
            )}
            <Button
              variant="outline"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => router.push("/feed")}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
