/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Automatically maps SERVER_URL or API_URL to client-side NEXT_PUBLIC_SERVER_URL
  env: {
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.SERVER_URL ||
      process.env.API_URL ||
      "",
  },

  // Proxy rewrites to forward /api/:path* to the backend server
  // Hides the backend server URL, prevents CORS issues, and provides seamless security
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.SERVER_URL ||
      process.env.API_URL ||
      "http://localhost:5000";
    const cleanUrl = backendUrl.replace(/\/+$/, "").replace(/\/api$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${cleanUrl}/api/:path*`,
      },
    ];
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
