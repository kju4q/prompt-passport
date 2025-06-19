"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { MiniKit } from "@worldcoin/minikit-js";
import { signIn, useSession } from "next-auth/react";

interface WorldIDButtonProps {
  onSignIn?: (address: string) => void;
  onVerified?: (nullifierHash: string) => void;
}

const WorldIDButtonClient = ({ onSignIn, onVerified }: WorldIDButtonProps) => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      setDebugInfo("World App is not installed");
      return;
    }

    setIsLoading(true);
    setDebugInfo("");

    try {
      // Get nonce from backend
      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      // Request wallet authentication
      const { commandPayload: generateMessageResult, finalPayload } =
        await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: "0",
          expirationTime: new Date(
            new Date().getTime() + 7 * 24 * 60 * 60 * 1000
          ),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: "Sign in to Prompt Passport",
        });

      if (finalPayload.status === "error") {
        setDebugInfo("Authentication failed");
        return;
      }

      // Sign in with NextAuth
      const result = await signIn("credentials", {
        payload: JSON.stringify(finalPayload),
        nonce,
        redirect: false,
      });

      if (result?.error) {
        setDebugInfo("Authentication failed: " + result.error);
        return;
      }

      setDebugInfo("Successfully authenticated!");

      // Call the appropriate callback
      if (onSignIn && finalPayload.address) {
        onSignIn(finalPayload.address);
      }

      if (onVerified && finalPayload.address) {
        onVerified(finalPayload.address);
      }
    } catch (error) {
      setDebugInfo(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("World App authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // @ts-ignore - MiniKit types are not up to date with the actual implementation
  const isWorldApp = MiniKit.isInstalled?.();
  console.log("Is World App detected?", isWorldApp);

  // If user is already signed in, show different UI
  if (session?.user) {
    const userAddress = (session.user as any).address;
    return (
      <div className="space-y-2">
        <div className="text-sm text-green-400 mb-2">
          Signed in as: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
        </div>
        <Button
          className="bg-gray-600 text-white hover:bg-gray-700 transition-all font-semibold"
          disabled
        >
          Already Signed In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {debugInfo && (
        <div className="text-sm text-gray-500 mb-2">{debugInfo}</div>
      )}
      <Button
        className="bg-white text-black hover:bg-gray-100 transition-all font-semibold"
        onClick={signInWithWallet}
        disabled={isLoading}
      >
        {isLoading
          ? "Signing in..."
          : isWorldApp
          ? "Sign in with World App"
          : "Install World App to Sign In"}
      </Button>
    </div>
  );
};

export default dynamic(() => Promise.resolve(WorldIDButtonClient), {
  ssr: false,
});
