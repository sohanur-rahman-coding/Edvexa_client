/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Allow images from external domains used in the product catalog
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Suppress harmless better-auth/mongodb peer warning in dev
  serverExternalPackages: [],
};

export default nextConfig;
