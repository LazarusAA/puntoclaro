import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'], // Modern image formats
    minimumCacheTTL: 31536000, // Cache images for 1 year
    dangerouslyAllowSVG: true, // Allow SVG images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'], // Tree-shake icon libraries
  },

  // Security headers for better performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Cache static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Specific cache control for HTML pages
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
