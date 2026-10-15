/**
 * Edvexa - Better-Auth Configuration (Server-Side)
 *
 * Handles the Google OAuth dance (redirect → Google → callback → session).
 * After the callback, the /auth/google-sync page exchanges the Better Auth
 * session for Edvexa's custom JWT via POST /api/auth/google on the Express backend.
 */

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

// Reuse a single MongoClient across invocations (Next.js module caching)
const client = new MongoClient(process.env.MONGODB_URI);

/**
 * Auto-detect the app base URL:
 * In production, always resolve to the live Vercel domain (edvexa-client.vercel.app)
 * or VERCEL_URL, ignoring any accidental "localhost" settings.
 * In local dev, falls back to http://localhost:3000.
 */
function getBaseURL() {
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://edvexa-client.vercel.app";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export const auth = betterAuth({
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(client.db()),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
