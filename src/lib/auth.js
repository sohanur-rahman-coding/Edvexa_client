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

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(client.db()),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
