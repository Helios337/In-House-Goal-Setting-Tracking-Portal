/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid 308 redirects on /api/v1/* POST (axios can drop body on redirect)
  skipTrailingSlashRedirect: true,

  env: {
    APP_NAME: "Goal Management Portal",
  },
  
  async rewrites() {
    // Only proxy the backend's /api/v1/* prefix.
    // /api/auth/* (NextAuth) and /api/events/* (Next route) must stay in Next.js.
    // API_BASE_URL is set in Docker (http://api:8000); browser uses /api/v1 + this rewrite.
    const backend =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000';
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
