import { cookies } from "next/headers";

// Admin credentials — must be set via environment variables
// Deliberately no fallback: missing vars cause login to always fail, not to open a backdoor
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? null;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? null;
export const SESSION_COOKIE = "rignova_admin_session";

if (!process.env.ADMIN_SESSION_SECRET) {
  console.warn(
    "[admin-auth] ADMIN_SESSION_SECRET is not set — sessions will be insecure. Set this env var in production."
  );
}
export const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ?? "rignova-admin-secret-key-change-in-production";

// Simple token: base64(username:timestamp:secret_hash)
export function createSessionToken(username: string): string {
  const payload = `${username}:${Date.now()}:${SESSION_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

export function validateSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    // Must have 3 parts and end with the secret
    if (parts.length < 3) return false;
    const secret = parts[parts.length - 1];
    return secret === SESSION_SECRET;
  } catch {
    return false;
  }
}

export function getUsernameFromToken(token: string): string {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] ?? "Admin";
  } catch {
    return "Admin";
  }
}

// Server-side: check if current request is authenticated
export async function getAdminSession(): Promise<{
  authenticated: boolean;
  username: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !validateSessionToken(token)) {
    return { authenticated: false, username: "" };
  }
  return { authenticated: true, username: getUsernameFromToken(token) };
}
