/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA headers for service worker and manifest
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

module.exports = nextConfig;
