import { cookies } from "next/headers";

/**
 * Get the authentication token from cookies (server-side only).
 * Used in Server Components and Server Actions.
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}
