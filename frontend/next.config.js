/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows you to bind build-time environment variables if needed
  env: {
    APP_NAME: "Goal Management Portal",
  },
  
  async rewrites() {
    return [
      {
        // Proxy all API requests to the FastAPI backend
        source: '/api/:path*',
        // Assuming FastAPI runs on localhost:8000
        // In production, this should point to your real backend URL via an env variable
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : 'http://127.0.0.1:8000/api/:path*',
      },
    ]
  },
  
  // Optional: Output as standalone for easier Docker deployments later
  output: 'standalone',
}

module.exports = nextConfig
