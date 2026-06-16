/** @type {import('next').NextConfig} */
const nextConfig = {
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
