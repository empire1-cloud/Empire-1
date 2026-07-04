/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const hybridBackendUrl = process.env.BACKEND_URL || "http://localhost:8001";
    const sla113BackendUrl = process.env.SLA113_BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: '/api/foundry/:path*',
        destination: `${sla113BackendUrl}/foundry/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${hybridBackendUrl}/api/:path*`,
      },
    ];
  },

};

export default nextConfig;
