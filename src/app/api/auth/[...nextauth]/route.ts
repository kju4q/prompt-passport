import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  verifySiweMessage,
  MiniAppWalletAuthSuccessPayload,
} from "@worldcoin/minikit-js";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "World ID",
      credentials: {
        payload: { label: "Payload", type: "text" },
        nonce: { label: "Nonce", type: "text" },
      },
      async authorize(credentials: any) {
        if (!credentials?.payload || !credentials?.nonce) {
          return null;
        }

        try {
          const payload = JSON.parse(
            credentials.payload
          ) as MiniAppWalletAuthSuccessPayload;
          const nonce = credentials.nonce as string;
          const validMessage = await verifySiweMessage(payload, nonce);

          if (validMessage.isValid) {
            // Create or update user in Supabase
            const { data: existingUser, error: fetchError } = await supabase
              .from("users")
              .select("*")
              .eq("wallet_address", payload.address)
              .single();

            if (fetchError && fetchError.code !== "PGRST116") {
              console.error("Error fetching user:", fetchError);
              return null;
            }

            let user;
            if (!existingUser) {
              // Create new user
              const { data: newUser, error: createError } = await supabase
                .from("users")
                .insert([
                  {
                    wallet_address: payload.address,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ])
                .select()
                .single();

              if (createError) {
                console.error("Error creating user:", createError);
                return null;
              }
              user = newUser;
            } else {
              // Update existing user's last login
              const { data: updatedUser, error: updateError } = await supabase
                .from("users")
                .update({ updated_at: new Date().toISOString() })
                .eq("wallet_address", payload.address)
                .select()
                .single();

              if (updateError) {
                console.error("Error updating user:", updateError);
                return null;
              }
              user = updatedUser;
            }

            return {
              id: user.id,
              address: payload.address,
              wallet_address: payload.address,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.address = user.address;
        token.wallet_address = user.wallet_address;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.address = token.address;
        session.user.wallet_address = token.wallet_address;
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
