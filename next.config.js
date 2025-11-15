/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMENAI_API_KEY: process.env.GEMENAI_API_KEY,
  },
}

module.exports = nextConfig
