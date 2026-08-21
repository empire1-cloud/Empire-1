/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const sla113BackendUrl = process.env.SLA113_BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: '/api/foundry/:path*',
        destination: `${sla113BackendUrl}/foundry/:path*`,
      },
    ];
  },
};

export default nextConfig;
