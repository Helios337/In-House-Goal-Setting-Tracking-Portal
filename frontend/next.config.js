/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows you to bind build-time environment variables if needed
  env: {
    APP_NAME: "Goal Management Portal",
  },
  
  async rewrites() {
    // Only proxy the backend's /api/v1/* prefix.
    // /api/auth/* (NextAuth) and /api/events/* (Next route) must stay in Next.js.
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
    ]
  },
  
  // Optional: Output as standalone for easier Docker deployments later
  output: 'standalone',
}

module.exports = nextConfig
