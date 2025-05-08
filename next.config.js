/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // This helps avoid hydration errors
    strictNextHead: false,
  },
  // Configure output for GitHub Pages
  output: 'standalone',
  // Set the base path for GitHub Pages (repository name)
  // This should be updated to match your repository name
  // Leave empty if using a custom domain
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Set the asset prefix for GitHub Pages
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  // Add headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
