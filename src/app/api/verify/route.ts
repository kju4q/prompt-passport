import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract the verification data from the request
    const { proof, merkle_root, nullifier_hash, verification_level } = body;

    // Verify the proof with WorldID
    const response = await fetch(
      "https://developer.worldcoin.org/api/v1/verify/app_" +
        process.env.NEXT_PUBLIC_WLD_APP_ID,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nullifier_hash,
          merkle_root,
          proof,
          verification_level,
          action: process.env.NEXT_PUBLIC_WC_ACTION || "prompt-passport",
          signal: "", // You can add a signal if needed
        }),
      }
    );

    const wldResponse = await response.json();

    if (response.ok && wldResponse.success) {
      // Verification successful
      return NextResponse.json({
        code: "success",
        detail: "Verification successful",
        wldResponse,
      });
    } else {
      // Verification failed
      return NextResponse.json(
        {
          code: "error",
          detail: "Verification failed",
          wldResponse,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("WorldID verification error:", error);
    return NextResponse.json(
      {
        code: "error",
        detail: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
