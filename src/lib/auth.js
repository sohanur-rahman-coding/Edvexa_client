/**
 * Edvexa - Better-Auth Configuration (Legacy / Unused)
 *
 * NOTE: Edvexa uses a custom JWT-based authentication system powered by the
 * Express backend (Edvexa-server). The endpoints are:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/google
 *   GET  /api/auth/me
 *
 * This better-auth instance is kept for reference only. The active auth
 * flow is managed entirely by AuthContext.jsx + api.js + the Express server.
 *
 * The Next.js API route at /api/auth/[...all] is NOT used by the application.
 */

// ─── Export a stub so the route handler doesn't crash on import ───────────────
export const auth = {
  api: {
    getSession: async () => null,
  },
};
