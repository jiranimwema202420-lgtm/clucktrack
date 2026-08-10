import type { NextConfig } from "next";
import { withPWA } from "@swavoti/next-pwa";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },

  devIndicators: {
    position: "bottom-right",
  },

  allowedDevOrigins: [
    "6000-firebase-studio-1764152813285.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    "clucktrack-6i22.vercel.app",
  ],
};

export default withPWA(nextConfig);
