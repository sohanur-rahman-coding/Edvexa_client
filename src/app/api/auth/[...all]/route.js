/**
 * Edvexa - Better-Auth Next.js Route Handler
 *
 * Handles all /api/auth/* routes including:
 *   GET  /api/auth/callback/google  ← OAuth redirect from Google
 *   POST /api/auth/sign-in/social
 *   POST /api/auth/sign-out
 *   GET  /api/auth/session
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);