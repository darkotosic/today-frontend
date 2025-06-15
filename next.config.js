/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["media.api-sports.io"],
  },
  env: {
    NEXT_PUBLIC_API_URL: "https://today-api-7f3i.onrender.com",
  },
};

module.exports = nextConfig;
