/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["grammy", "node-fetch", "form-data"],
  },
  images: {
    domains: ["t.me", "api.telegram.org"],
  },
};

module.exports = nextConfig;
