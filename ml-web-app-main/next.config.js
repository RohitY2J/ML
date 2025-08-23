/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      's3.coinmarketcap.com',
      'static-gravity.s3.amazonaws.com',
      'images.unsplash.com',
      'localhost'
    ],
    unoptimized: true
  },
  // Removed output: 'export' and distDir: 'out' for Netlify compatibility
}

module.exports = nextConfig 