/**
 * Edvexa - Better-Auth Client
 *
 * Used client-side to trigger social OAuth flows.
 * No baseURL needed — defaults to current origin so it works in both
 * local development (localhost:3000) and Vercel production.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
