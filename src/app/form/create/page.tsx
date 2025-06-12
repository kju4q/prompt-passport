"use client";

import PromptForm from "../PromptForm";

export default function CreatePromptPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Submit a Prompt</h1>
      <PromptForm />
    </div>
  );
}
