"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MiniKit } from "@worldcoin/minikit-js";

interface WorldIDButtonProps {
  onVerified?: (nullifierHash: string) => void;
}

export default function WorldIDButton({ onVerified }: WorldIDButtonProps = {}) {
  const [IDKitWidget, setIDKitWidget] = useState<any>(null);
  const [VerificationLevel, setVerificationLevel] = useState<any>(null);
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
          setVerificationLevel(idkitModule.VerificationLevel);
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

  if (!IDKitWidget || !VerificationLevel) {
    return <Button disabled>Loading World ID...</Button>;
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
      // @ts-ignore - MiniKit types are not up to date with the actual implementation
      const result = await MiniKit.requestVerification({
        app_id: `app_${process.env.NEXT_PUBLIC_WLD_APP_ID}`,
        action: process.env.NEXT_PUBLIC_WC_ACTION || "prompt-passport",
      });
      if (onVerified && result.nullifier_hash) {
        onVerified(result.nullifier_hash);
      }
    } catch (error) {
      console.error("World App verification error:", error);
    }
  };

  // @ts-ignore - MiniKit types are not up to date with the actual implementation
  const isWorldApp = MiniKit.isInstalled?.();

  return isWorldApp ? (
    <Button
      className="bg-white text-black hover:bg-gray-100 transition-all font-semibold"
      onClick={handleWorldAppVerify}
    >
      Verify with World ID
    </Button>
  ) : (
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
  );
}
