/**
 * Generic tracking primitives.
 *
 * Provider = `{ accepts?, track }`. Use-case dispatcher invokes providers
 * whose `accepts` matches `input.context.source.kind` (or providers without
 * `accepts`, which always run).
 *
 * Per-event modules (e.g. `add-to-cart`) define their concrete `TInput`
 * (carrying the discriminated `context.source`) and re-export the bound
 * provider/use-case types.
 */

/**
 * Canonical set of source `kind` literals usable across all tracking events.
 * Extend here when a new universal source category is needed.
 */
export type TrackingSourceKind = "direct";

/**
 * Builds a discriminated source variant: `{ kind: K } & Payload`.
 *
 * Example:
 *   type SearchSource = TrackingSource<"search", { queryId: string; userId: string }>;
 *   type DirectSource = TrackingSource<"direct">;
 */
export type TrackingSource<K extends TrackingSourceKind, Payload = unknown> = {
  kind: K;
} & Payload;

export type TrackingProvider<TInput> = {
  /**
   * Source kinds this provider handles. Omit = always runs.
   */
  accepts?: readonly TrackingSourceKind[];
  /**
   * Method shorthand (not arrow property) — TS treats it as bivariant in
   * `TInput`, so providers declaring narrower inputs (e.g. with required
   * context) remain assignable to the base `TrackingProvider<TInput>` shape.
   */
  track(input: TInput): Promise<void> | void;
};
