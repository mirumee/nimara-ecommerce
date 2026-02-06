import * as jose from "jose";

export interface JWTPayload {
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  type?: string;
  user_id: string;
}

export interface TokenValidationResult {
  error?: string;
  payload?: JWTPayload;
  valid: boolean;
}

/**
 * Decode a JWT token without verification
 * Useful for extracting claims when JWKS verification is not needed
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jose.decodeJwt(token) as JWTPayload;

    
return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract the vendor ID from a JWT token
 * The vendor ID is stored in the user_id claim
 */
export function extractVendorId(token: string): string | null {
  const payload = decodeToken(token);

  
return payload?.user_id || null;
}

/**
 * Extract the Saleor domain from a JWT token or header
 */
export function extractSaleorDomain(
  token?: string,
  headerDomain?: string,
): string | null {
  // Priority: header > token issuer
  if (headerDomain) {
    return headerDomain;
  }

  if (token) {
    const payload = decodeToken(token);

    if (payload?.iss) {
      // Extract domain from issuer URL
      try {
        const url = new URL(payload.iss);

        
return url.hostname;
      } catch {
        return payload.iss;
      }
    }
  }

  return null;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);

  if (!payload?.exp) {
    return false; // No expiration claim, consider valid
  }
  
return Date.now() >= payload.exp * 1000;
}

/**
 * Validate a JWT token using JWKS
 * TODO: Implement full JWKS verification when needed
 */
export async function validateToken(
  token: string,
  jwksUri?: string,
): Promise<TokenValidationResult> {
  try {
    const payload = decodeToken(token);

    if (!payload) {
      return { valid: false, error: "Invalid token format" };
    }

    if (isTokenExpired(token)) {
      return { valid: false, error: "Token expired" };
    }

    // TODO: Implement JWKS verification
    // For now, just decode and check expiration
    // In production, verify signature using:
    // const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));
    // const { payload } = await jose.jwtVerify(token, JWKS);

    return { valid: true, payload };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Create authorization headers for Saleor API requests
 */
export function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
