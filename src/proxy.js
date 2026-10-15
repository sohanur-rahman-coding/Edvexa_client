/**
 * Edvexa - Next.js Route Protection Proxy
 *
 * Route protection is handled gracefully on the client via AuthContext
 * (which reads JWTs from localStorage) and enforced securely on the backend
 * API for all data access. This proxy allows RSC navigation without false-positive
 * cookie redirect loops.
 */

import { NextResponse } from "next/server";

export function proxy(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/admin/:path*"],
};
