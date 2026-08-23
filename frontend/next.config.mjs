/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:3010/api/:path*",
      },
    ];
  },
};

export default nextConfig;