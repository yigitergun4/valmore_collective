import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/valmore_collective",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
