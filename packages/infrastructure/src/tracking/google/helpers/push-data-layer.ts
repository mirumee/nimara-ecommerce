import { isSsr } from "#root/config";

import type { DataLayerEntry, DataLayerWindow } from "../types";

type PushDataLayer = {
  (entry: DataLayerEntry): void;
  (
    command: "consent",
    action: "default" | "update",
    state: Record<string, string>,
  ): void;
};

/**
 * Pushes to `window.dataLayer`. No-op on the server.
 *
 * - Event form — `pushDataLayer({ event: "add_to_cart", ... })` — the object
 *   is pushed as-is (GTM Enhanced Ecommerce). Entries carrying an `ecommerce`
 *   key are preceded by `{ ecommerce: null }` — GA4 requires clearing the
 *   previous ecommerce object so stale items don't merge into the next event.
 * - Consent Mode v2 form — `pushDataLayer("consent", "update", { ... })` — the
 *   `arguments` object is pushed, which is the shape GTM requires for
 *   gtag/consent commands. A literal array is read as data-layer data, not a
 *   command, so the consent state would never apply.
 *
 * Declared as a `function` expression (not an arrow) on purpose: arrow
 * functions have no `arguments` binding, which the consent form relies on.
 */

export const pushDataLayer: PushDataLayer = function (): void {
  if (isSsr) {
    return;
  }

  const win = window as DataLayerWindow;
  const dataLayer = (win.dataLayer = win.dataLayer ?? []);

  // eslint-disable-next-line prefer-rest-params
  const entry = arguments.length === 1 ? arguments[0] : arguments;

  if (
    arguments.length === 1 &&
    entry &&
    typeof entry === "object" &&
    "ecommerce" in entry
  ) {
    dataLayer.push({ ecommerce: null } as unknown as DataLayerEntry);
  }

  dataLayer.push(entry as unknown as DataLayerEntry);
};
