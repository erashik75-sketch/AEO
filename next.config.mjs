/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/dashboard/brands", destination: "/brands" },
      { source: "/dashboard/brands/:path*", destination: "/brands/:path*" },
      { source: "/dashboard/billing", destination: "/billing" },
      { source: "/dashboard/settings", destination: "/settings" },
    ];
  },
};

export default nextConfig;
