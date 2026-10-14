/**
 * Edvexa - Auth API Route Handler (Stub)
 *
 * NOTE: Edvexa uses a custom JWT system via the Express backend (port 5000).
 * This route exists as a stub to prevent 404 errors for any stale /api/auth requests.
 *
 * All real auth operations go through:
 *   POST http://localhost:5000/api/auth/login
 *   POST http://localhost:5000/api/auth/register
 *   POST http://localhost:5000/api/auth/google
 *   GET  http://localhost:5000/api/auth/me
 */

export async function GET() {
  return Response.json({
    success: false,
    message:
      "This route is not active. Edvexa uses a custom JWT backend at /api/auth/* via the Express server.",
    docs: "See Edvexa-server/src/routes/authRoutes.js",
  });
}

export async function POST() {
  return Response.json({
    success: false,
    message:
      "This route is not active. Edvexa uses a custom JWT backend at /api/auth/* via the Express server.",
    docs: "See Edvexa-server/src/routes/authRoutes.js",
  });
}