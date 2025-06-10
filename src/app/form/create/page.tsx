"use client";

import { useEffect, useState } from "react";
import PromptForm from "../PromptForm";
import WorldIDButton from "@/components/WorldIDButton";

export default function CreatePromptPage() {
  const [nullifierHash, setNullifierHash] = useState<string | null>(null);

  useEffect(() => {
    const storedHash = localStorage.getItem("world-id-nullifier");
    if (storedHash) {
      setNullifierHash(storedHash);
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Submit a Prompt</h1>

      {!nullifierHash ? (
        <div className="space-y-4">
          <p className="text-gray-300">
            Please verify your World ID to submit prompts.
          </p>
          <WorldIDButton
            onVerified={(hash: string) => setNullifierHash(hash)}
          />
        </div>
      ) : (
        <PromptForm nullifierHash={nullifierHash} />
      )}
    </div>
  );
}
