/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DATABASE_URL ? undefined : 'export',
  images: {
    unoptimized: true, // Necessary for static client-side build exports
  },
};

module.exports = nextConfig;
