import { decodeJwt } from "jose";

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwt(token);

    if (!payload.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime >= payload.exp;
  } catch {
    return true;
  }
}

/**
 * Check if a JWT token is expiring soon (within buffer seconds)
 * Useful for proactive token refresh
 */
export function isTokenExpiringSoon(
  token: string,
  bufferSeconds = 300, // 5 minutes default
): boolean {
  try {
    const payload = decodeJwt(token);

    if (!payload.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp - currentTime <= bufferSeconds;
  } catch {
    return true;
  }
}
