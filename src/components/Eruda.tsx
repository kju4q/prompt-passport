"use client";

import eruda from "eruda";
import { ReactNode, useEffect } from "react";

export const Eruda = (props: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        eruda.init();
        console.log("Eruda initialized successfully");
      } catch (error) {
        console.error("Eruda failed to initialize:", error);
      }
    }
  }, []);

  return <>{props.children}</>;
};
