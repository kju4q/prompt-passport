import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Generate a secure nonce (at least 8 alphanumeric characters)
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store the nonce in a secure cookie
  cookies().set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ nonce });
}
