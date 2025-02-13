/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "epirywpqxklckhdtrolk.supabase.co",
      },
      // Add any other domains as needed.
    ],
  },
};

module.exports = nextConfig;
