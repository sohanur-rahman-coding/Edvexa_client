/**
 * Edvexa - Next.js Route Protection Proxy
 *
 * This file is the Next.js proxy (formerly "middleware") that runs on the Edge
 * Runtime before each request. It protects routes that require authentication.
 *
 * Strategy:
 *   - Read the `edvexa_auth_presence` cookie set by AuthContext on login
 *   - If the cookie is absent on a protected route → redirect to /signin
 *   - The actual JWT verification still happens server-side in the Express backend
 *     for every protected API call (provides double protection)
 *
 * Protected routes:
 *   /orders  - Any authenticated user
 *   /admin   - Any authenticated user (role enforcement is done in the page component)
 */

import { NextResponse } from "next/server";

/** Routes that require the user to be logged in (matched by prefix) */
const PROTECTED_PREFIXES = ["/orders", "/admin"];

/**
 * Main proxy function — runs before every request matching the `config.matcher`.
 * Must be exported as `proxy` (default or named) in this version of Next.js.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check for the auth presence cookie (set by AuthContext when JWT token is saved)
  const authCookie = request.cookies.get("edvexa_auth_presence");
  const isLoggedIn = !!authCookie?.value;

  if (!isLoggedIn) {
    // Redirect unauthenticated users to sign-in, preserving the originally
    // requested URL as the ?redirect= query param
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on these paths (not on static files or Next.js internal routes)
  matcher: ["/orders/:path*", "/admin/:path*"],
};
