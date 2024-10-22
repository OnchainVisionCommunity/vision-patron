// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public', // Specify the output directory for the generated service worker and PWA assets
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
  register: true, // Registers the service worker
  skipWaiting: true // Instructs the new service worker to take control of the page immediately
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
  typescript: {
    // This will allow production builds to complete even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
  },
});

module.exports = nextConfig;
