import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/portal",
        destination: "/portal/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
