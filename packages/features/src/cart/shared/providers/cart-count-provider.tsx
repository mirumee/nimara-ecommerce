"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useOptimistic,
} from "react";

interface CartCountContextValue {
  /**
   * Reports the pending cart lines quantity change for `key`, expressed against
   * the server rendered count. Must be called inside a transition - the entry
   * is discarded once that transition settles and the revalidated count takes
   * over.
   *
   * Reporting the same `key` again replaces the previous entry, so a caller
   * that repeats a change for one line (a quantity input being typed into)
   * should key by line id, while a caller whose changes accumulate (adding the
   * same variant twice) needs a distinct key per change.
   */
  applyCountDelta: (key: string, delta: number) => void;
  /** Applies the pending changes to a server rendered cart lines quantity. */
  resolveCount: (serverCount: number) => number;
}

const CartCountContext = createContext<CartCountContextValue | null>(null);

const NO_PENDING_DELTAS: ReadonlyMap<string, number> = new Map();

/**
 * Lets cart mutations anywhere in the tree update the cart counters in the
 * header right away, instead of waiting for revalidation.
 *
 * It holds pending deltas rather than the count itself, so the server rendered
 * count stays the single source of truth and nothing has to be reconciled by
 * hand when it changes.
 */
export const CartCountProvider = ({ children }: { children: ReactNode }) => {
  const [pendingDeltas, applyCountDelta] = useOptimistic(
    NO_PENDING_DELTAS,
    (deltas, [key, delta]: [string, number]) =>
      new Map(deltas).set(key, delta) as ReadonlyMap<string, number>,
  );

  const value = useMemo(() => {
    const pendingDelta = [...pendingDeltas.values()].reduce(
      (sum, delta) => sum + delta,
      0,
    );

    return {
      applyCountDelta: (key: string, delta: number) =>
        applyCountDelta([key, delta]),
      resolveCount: (serverCount: number) =>
        Math.max(serverCount + pendingDelta, 0),
    };
  }, [pendingDeltas, applyCountDelta]);

  return (
    <CartCountContext.Provider value={value}>
      {children}
    </CartCountContext.Provider>
  );
};

export const useCartCount = () => {
  const context = useContext(CartCountContext);

  if (!context) {
    throw new Error("useCartCount must be used within a <CartCountProvider />");
  }

  return context;
};
