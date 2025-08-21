import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Essential for connecting to your Render backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/v1/:path*`
      }
    ];
  },
  
  // Allow images from your backend
  images: {
    domains: [
      'creatorpulse-backend.onrender.com', // Your Render URL
      'localhost', // For local development
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
    ];
  },
};

export default nextConfig;
