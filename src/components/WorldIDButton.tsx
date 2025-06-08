"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function WorldIDButton() {
  const [IDKitWidget, setIDKitWidget] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadIDKit = async () => {
      try {
        console.log("Loading @worldcoin/idkit...");
        const idkitModule = await import("@worldcoin/idkit");
        console.log("IDKit module loaded:", idkitModule);
        console.log("Available exports:", Object.keys(idkitModule));

        if (idkitModule.IDKitWidget) {
          setIDKitWidget(() => idkitModule.IDKitWidget);
          console.log("IDKitWidget component found and set");
        } else {
          setError("IDKitWidget not found in module");
        }
      } catch (err) {
        console.error("Failed to load IDKit:", err);
        setError(err?.toString() || "Failed to load IDKit");
      }
    };

    loadIDKit();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!IDKitWidget) {
    return <Button disabled>Loading World ID...</Button>;
  }

  const handleVerify = async (proof: any) => {
    console.log("Verify called with:", proof);
    try {
      const res = await fetch("/api/verify-world-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proof),
      });

      if (!res.ok) {
        throw new Error("Verification failed.");
      }

      return await res.json();
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const onSuccess = (result: any) => {
    console.log("✅ Verified with World ID:", result);
  };

  return (
    <IDKitWidget
      app_id="app_13ddcecdf5c93cf7253c545d188b22cd"
      action="prompt-passport-demo"
      handleVerify={handleVerify}
      onSuccess={onSuccess}
      verification_level="device"
      // For testing, you can also try:
      // verification_level="orb"
    >
      {({ open }: { open: () => void }) => (
        <Button
          className="bg-white text-black hover:bg-gray-100 transition-all font-semibold"
          onClick={open}
        >
          Verify with World ID
        </Button>
      )}
    </IDKitWidget>
  );
}
