"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface VerificationContextType {
  isVerified: boolean;
  nullifierHash: string | null;
  setVerification: (nullifierHash: string) => void;
  clearVerification: () => void;
  loading: boolean;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [nullifierHash, setNullifierHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load verification status from localStorage on mount
  useEffect(() => {
    const storedVerification = localStorage.getItem("world-id-verified");
    const storedNullifierHash = localStorage.getItem("world-id-nullifier-hash");

    if (storedVerification === "true" && storedNullifierHash) {
      setIsVerified(true);
      setNullifierHash(storedNullifierHash);
    }
    setLoading(false);
  }, []);

  const setVerification = (hash: string) => {
    setIsVerified(true);
    setNullifierHash(hash);
    localStorage.setItem("world-id-verified", "true");
    localStorage.setItem("world-id-nullifier-hash", hash);
  };

  const clearVerification = () => {
    setIsVerified(false);
    setNullifierHash(null);
    localStorage.removeItem("world-id-verified");
    localStorage.removeItem("world-id-nullifier-hash");
  };

  return (
    <VerificationContext.Provider
      value={{
        isVerified,
        nullifierHash,
        setVerification,
        clearVerification,
        loading,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error(
      "useVerification must be used within a VerificationProvider"
    );
  }
  return context;
}
