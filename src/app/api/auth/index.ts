import NextAuth from "next-auth";
import { authOptions } from "./[...nextauth]/route";

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
