import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
        console.log(
          "Auth attempt with credentials:",
          !!credentials?.payload,
          !!credentials?.nonce
        );

        if (!credentials?.payload || !credentials?.nonce) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const payload = JSON.parse(credentials.payload);
          const nonce = credentials.nonce as string;

          console.log("Verifying SIWE message for address:", payload.address);

          // Import verifySiweMessage dynamically to avoid Edge Runtime issues
          const { verifySiweMessage } = await import("@worldcoin/minikit-js");
          const validMessage = await verifySiweMessage(payload, nonce);

          console.log("SIWE verification result:", validMessage.isValid);

          if (validMessage.isValid) {
            console.log("Creating/updating user in database");

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
              console.log("Creating new user");
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
              console.log("Updating existing user");
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

            console.log("Auth successful, returning user:", user.id);
            return {
              id: user.id,
              address: payload.address,
              wallet_address: payload.address,
            };
          }
          console.log("SIWE verification failed");
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
