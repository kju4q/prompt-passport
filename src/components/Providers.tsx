"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { VerificationProvider } from "@/contexts/VerificationContext";
import dynamic from "next/dynamic";

// Dynamically import client-side components
const MiniKitProvider = dynamic(
  () =>
    import("@worldcoin/minikit-js/minikit-provider").then(
      (mod) => mod.MiniKitProvider
    ),
  { ssr: false }
);

const Eruda = dynamic(
  () => import("@/components/Eruda").then((mod) => mod.Eruda),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider>
      <VerificationProvider>
        <Eruda>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "white",
                border: "1px solid #e5e7eb",
                color: "#374151",
              },
            }}
          />
        </Eruda>
      </VerificationProvider>
    </MiniKitProvider>
  );
}
