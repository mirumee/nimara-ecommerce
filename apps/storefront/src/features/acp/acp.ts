import { NextResponse } from "next/server";

type CachedResponse = {
  data: unknown;
  headers: Record<string, string>;
  status: number;
  timestamp: number;
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
  ): void {
    this.storage.set(key, {
      data,
      status,
      headers,
      timestamp: Date.now(),
    });
  }

  get(key: string): CachedResponse | null {
    const cached = this.storage.get(key);

    if (!cached) {
      return null;
    }

    // If the cached response is older than CACHE_DURATION, delete it and return null
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.storage.delete(key);

      return null;
    }

    return cached;
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
}

export const idempotencyStorage = new IdempotencyStorage();
