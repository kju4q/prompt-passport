"use client";

import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import { Button } from "@/components/ui/button";

export default function WorldIDButton() {
  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID verified:", result);
    // You’ll get a `proof` and `nullifier_hash` here.
    // You can now send it to your backend if needed.
  };

  return (
    <IDKitWidget
      app_id="YOUR_WORLDCOIN_APP_ID" // Replace this
      action="promptpin_demo" // Can be any string
      onSuccess={handleVerify}
    >
      {({ open }) => (
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
