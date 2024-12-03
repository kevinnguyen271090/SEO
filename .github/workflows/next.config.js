/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.shopify.com'],
    unoptimized: true
  },
  env: {
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  }
}

module.exports = nextConfig;