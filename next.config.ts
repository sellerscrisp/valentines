/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "epirywpqxklckhdtrolk.supabase.co",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "c7bfe9a09b002ddbe32c142282d69eb5.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "c7bfe9a09b002ddbe32c142282d69eb5.r2.cloudflarestorage.com",
      },
      // Add any other domains as needed.
    ],
  },
};

module.exports = nextConfig;
