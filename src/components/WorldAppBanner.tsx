"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function WorldAppBanner() {
  const [isWorldApp, setIsWorldApp] = useState(false);

  useEffect(() => {
    setIsWorldApp(MiniKit.isInstalled());
  }, []);

  if (!isWorldApp) return null;
  return (
    <div className="bg-green-600 text-white p-2 text-center">
      Welcome, World App user! 🎉
    </div>
  );
}
