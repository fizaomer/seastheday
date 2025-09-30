/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.open-meteo.com',
      },
    ],
  },
}

module.exports = nextConfig

