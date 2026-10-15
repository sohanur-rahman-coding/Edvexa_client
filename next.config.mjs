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

    // IMPORTANT: Better Auth and the Express backend both share the /api/auth/* prefix.
    // - Express handles:  /api/auth/login, /api/auth/register, /api/auth/me, /api/auth/google
    // - Better Auth handles: /api/auth/callback/*, /api/auth/sign-in/*, /api/auth/session, /api/auth/sign-out
    //
    // We CANNOT use a wildcard /api/auth/:path* rewrite because it intercepts Better Auth routes.
    // Instead we explicitly enumerate only the Express routes that need proxying.
    return [
      // ── Express custom JWT auth routes ────────────────────────────────────────
      { source: "/api/auth/login",    destination: `${cleanUrl}/api/auth/login` },
      { source: "/api/auth/register", destination: `${cleanUrl}/api/auth/register` },
      { source: "/api/auth/me",       destination: `${cleanUrl}/api/auth/me` },
      { source: "/api/auth/google",   destination: `${cleanUrl}/api/auth/google` },
      // ── All other Express API routes ──────────────────────────────────────────
      { source: "/api/products/:path*",  destination: `${cleanUrl}/api/products/:path*` },
      { source: "/api/inventory/:path*", destination: `${cleanUrl}/api/inventory/:path*` },
      { source: "/api/orders/:path*",    destination: `${cleanUrl}/api/orders/:path*` },
      // NOTE: /api/auth/callback/google, /api/auth/session, /api/auth/sign-in/social
      // are NOT listed here — they are handled by the Next.js Better Auth route handler.
    ];
  },

  // Allow images from external domains used in the product catalog
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Suppress harmless better-auth/mongodb peer warning in dev
  serverExternalPackages: [],
};

export default nextConfig;
