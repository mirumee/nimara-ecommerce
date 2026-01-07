import { vi } from "vitest";

export function MagicMock<T extends object>(mocks = {}): T {
  return new Proxy(mocks as T, {
    get(target, prop, receiver) {
      if (!(prop in target)) {
        // @ts-expect-error Vitest Procedure
        target[prop as keyof T] = vi.fn();
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}
