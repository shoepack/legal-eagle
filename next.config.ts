import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase body size limit to 10MB for PDF uploads
    },
  },
};

export default nextConfig;
