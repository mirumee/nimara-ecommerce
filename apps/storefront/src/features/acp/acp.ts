import { NextResponse } from "next/server";

type CachedResponse = {
  data: unknown;
  headers: Record<string, string>;
  requestHash: string;
  status: number;
  timestamp: number;
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Computes a deterministic hash of the request body for conflict detection.
 * Used to detect if the same idempotency key is used with different request data.
 * Ensures consistent hashing regardless of property order.
 */
const computeRequestHash = (requestBody: unknown): string => {
  if (!requestBody) {
    return "";
  }

  const stringified = JSON.stringify(requestBody, (key, value) => {
    // Sort object keys for deterministic hashing
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce(
          (acc, k) => {
            acc[k] = value[k];

            return acc;
          },
          {} as Record<string, unknown>,
        );
    }

    return value;
  });

  return stringified;
};

/**
 * In-memory storage for idempotent request responses.
 * This is a simple implementation and should be replaced with a more robust solution (e.g., Redis) in production.
 * TODO: Can be removed once we have a proper distributed cache.
 */
class IdempotencyStorage {
  private storage = new Map<string, CachedResponse>();

  set(
    key: string,
    data: unknown,
    status: number,
    headers: Record<string, string>,
    requestBody?: unknown,
  ): void {
    this.storage.set(key, {
      data,
      status,
      headers,
      timestamp: Date.now(),
      requestHash: computeRequestHash(requestBody),
    });
  }

  get(
    key: string,
    requestBody?: unknown,
  ): { cached: CachedResponse; conflict: boolean } | null {
    const cached = this.storage.get(key);

    if (!cached) {
      return null;
    }

    // If the cached response is older than CACHE_DURATION, delete it and return null
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.storage.delete(key);

      return null;
    }

    // Check if the request body matches the cached request.
    // Only check for conflicts if requestBody is provided (i.e., not a GET request).
    const currentHash = computeRequestHash(requestBody);
    const conflict = currentHash !== "" && cached.requestHash !== currentHash;

    return { cached, conflict };
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  cleanup(): void {
    const now = Date.now();

    for (const [key, cached] of this.storage.entries()) {
      // If the cached response is older than CACHE_DURATION, delete it
      if (now - cached.timestamp > CACHE_DURATION) {
        this.storage.delete(key);
      }
    }
  }

  createResponse(cached: CachedResponse): NextResponse {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: cached.headers,
    });
  }

  createConflictResponse(): NextResponse {
    return NextResponse.json(
      [
        {
          code: "CONFLICT_ERROR",
          message:
            "Idempotency key reused with different request body (409 Conflict)",
        },
      ],
      { status: 409 },
    );
  }
}

export const idempotencyStorage = new IdempotencyStorage();
