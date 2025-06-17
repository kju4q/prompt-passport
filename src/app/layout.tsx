import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { VerificationProvider } from "@/contexts/VerificationContext";
import "./globals.css";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Eruda } from "@/components/Eruda";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Passport",
  description: "Your journey through AI creativity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MiniKitProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Eruda>
            <VerificationProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#374151",
                  },
                }}
              />
            </VerificationProvider>
          </Eruda>
        </body>
      </MiniKitProvider>
    </html>
  );
}
