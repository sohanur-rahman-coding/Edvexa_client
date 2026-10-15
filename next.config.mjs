/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Automatically maps SERVER_URL or API_URL to client-side NEXT_PUBLIC_SERVER_URL
  // This allows deploying on Vercel without triggering the NEXT_PUBLIC_ warning
  env: {
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.SERVER_URL ||
      process.env.API_URL ||
      "",
  },

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
