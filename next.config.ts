import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Supabase realtime dependency warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ignore the critical dependency warning for Supabase realtime
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
    ];

    return config;
  },
  serverExternalPackages: ["@supabase/realtime-js"],
};

export default nextConfig;
