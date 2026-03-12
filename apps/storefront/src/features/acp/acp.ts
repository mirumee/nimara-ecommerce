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
 * Computes a simple hash of the request body for conflict detection.
 * Used to detect if the same idempotency key is used with different request data.
 */
const computeRequestHash = (requestBody: unknown): string => {
  return JSON.stringify(requestBody);
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

    // Check if the request body matches the cached request
    const conflict =
      requestBody !== undefined &&
      cached.requestHash !== computeRequestHash(requestBody);

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
