/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95, 100],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://corematrix-fitness.onrender.com/api/:path*'
          : 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
