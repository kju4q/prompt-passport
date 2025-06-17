"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MiniKit } from "@worldcoin/minikit-js";
import dynamic from "next/dynamic";

interface WorldIDButtonProps {
  onVerified?: (nullifierHash: string) => void;
}

// Create a client-only version of the component
const WorldIDButtonClient = ({ onVerified }: WorldIDButtonProps) => {
  const [IDKitWidget, setIDKitWidget] = useState<any>(null);
  const [VerificationLevel, setVerificationLevel] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkEnvironment = () => {
      if (typeof window === "undefined") {
        setDebugInfo("Window is undefined - running on server");
        return false;
      }

      const isSecureContext = window.isSecureContext;
      const hasCrypto = !!window.crypto;
      const hasSubtle = !!(window.crypto && window.crypto.subtle);
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;

      const debugMessage = [
        `Secure Context: ${isSecureContext}`,
        `Has Crypto: ${hasCrypto}`,
        `Has Subtle: ${hasSubtle}`,
        `Protocol: ${protocol}`,
        `Hostname: ${hostname}`,
        `User Agent: ${navigator.userAgent}`,
      ].join("\n");

      setDebugInfo(debugMessage);
      console.log("Environment check:", debugMessage);

      // Allow on localhost regardless of protocol
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return true;
      }

      // For other environments, require secure context
      return isSecureContext && hasCrypto && hasSubtle;
    };

    const initialize = async () => {
      try {
        if (!checkEnvironment()) {
          throw new Error(
            "Environment check failed. Check debug info for details."
          );
        }

        // Try to load the module
        const idkitModule = await import("@worldcoin/idkit");
        console.log("IDKit module loaded successfully");

        if (idkitModule.IDKitWidget && idkitModule.VerificationLevel) {
          setIDKitWidget(() => idkitModule.IDKitWidget);
          setVerificationLevel(idkitModule.VerificationLevel);
          setIsInitialized(true);
        } else {
          throw new Error("Required IDKit components not found");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err?.toString() || "Failed to initialize");
        setDebugInfo(
          (prev) => `${prev}\n\nInitialization error: ${err?.toString()}`
        );
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-red-500">Error: {error}</div>
        {debugInfo && (
          <div className="text-sm text-gray-500 whitespace-pre-line">
            {debugInfo}
          </div>
        )}
      </div>
    );
  }

  if (!isInitialized || !IDKitWidget || !VerificationLevel) {
    return (
      <div className="space-y-2">
        <Button disabled>Loading World ID...</Button>
        {debugInfo && (
          <div className="text-sm text-gray-500 whitespace-pre-line">
            {debugInfo}
          </div>
        )}
      </div>
    );
  }

  async function handleVerify(data: any) {
    console.log("Verify called with:", data);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response.code === "success") {
        console.log("Successfully authenticated with World ID");
      } else {
        console.log("Authentication failed with World ID");
        console.log("error:", response.wldResponse);
      }

      return response;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  }

  const onSuccess = (result: any) => {
    console.log("Verified with World ID:", result);
    if (onVerified && result.nullifier_hash) {
      onVerified(result.nullifier_hash);
    }
  };

  const handleWorldAppVerify = async () => {
    try {
      setDebugInfo("Starting verification...");
      // @ts-ignore - MiniKit types are not up to date with the actual implementation
      const result = await MiniKit.requestVerification({
        app_id: `app_${process.env.NEXT_PUBLIC_WLD_APP_ID}`,
        action: process.env.NEXT_PUBLIC_WC_ACTION || "prompt-passport",
      });
      setDebugInfo("Verification successful!");
      if (onVerified && result.nullifier_hash) {
        onVerified(result.nullifier_hash);
      }
    } catch (error) {
      setDebugInfo(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("World App verification error:", error);
    }
  };

  // @ts-ignore - MiniKit types are not up to date with the actual implementation
  const isWorldApp = MiniKit.isInstalled?.();
  console.log("Is World App detected?", isWorldApp);

  return (
    <div className="space-y-2">
      {debugInfo && (
        <div className="text-sm text-gray-500 mb-2">{debugInfo}</div>
      )}
      <IDKitWidget
        app_id={`app_${process.env.NEXT_PUBLIC_WLD_APP_ID}`}
        action={process.env.NEXT_PUBLIC_WC_ACTION || "prompt-passport"}
        onSuccess={onSuccess}
        handleVerify={handleVerify}
        verification_level={VerificationLevel.Device}
        enableTelemetry={true}
        theme="dark"
        autoClose={true}
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
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(WorldIDButtonClient), {
  ssr: false,
});
