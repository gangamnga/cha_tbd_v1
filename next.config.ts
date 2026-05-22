import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async redirects() {
    return [
      // Redirect cũ → mới sau khi đổi tên route
      { source: '/on-lanh', destination: '/chung-nhan', permanent: true },
      { source: '/on-lanh/:path*', destination: '/chung-nhan/:path*', permanent: true },
    ]
  },
};

export default nextConfig;
