// src/app/api/verify-world-id/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(
    "https://developer.worldcoin.org/api/v1/verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: process.env.WORLDCOIN_APP_ID,
        action: "promptpin_demo",
        signal: "", // Optional, you can leave blank for now
        proof: body.proof,
        nullifier_hash: body.nullifier_hash,
        merkle_root: body.merkle_root,
        credential_type: body.credential_type,
      }),
    }
  );

  const data = await response.json();

  if (data.success) {
    return NextResponse.json({ verified: true });
  } else {
    return NextResponse.json({ verified: false, error: data }, { status: 400 });
  }
}
