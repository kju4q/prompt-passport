import NextAuth from "next-auth";
import { authOptions } from "../auth.config";

export const runtime = "nodejs";

const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;
