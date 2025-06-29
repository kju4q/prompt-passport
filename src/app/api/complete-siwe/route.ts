import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = (await req.json()) as IRequestPayload;

  // Verify the nonce matches what we stored
  const cookieStore = await cookies();
  const storedNonce = cookieStore.get("siwe")?.value;
  if (nonce !== storedNonce) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    });
  }

  try {
    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce);

    if (validMessage.isValid) {
      // Clear the nonce cookie after successful verification
      const cookieStore = await cookies();
      cookieStore.delete("siwe");

      return NextResponse.json({
        status: "success",
        isValid: true,
        address: payload.address,
      });
    }

    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid signature",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message,
    });
  }
}
