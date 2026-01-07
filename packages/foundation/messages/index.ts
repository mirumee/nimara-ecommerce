// Export messages for static imports
export { default as enUS } from "./en-US.json";
export { default as enGB } from "./en-GB.json";

// Export messages map for dynamic imports
export const messages = {
    "en-US": () => import("./en-US.json"),
    "en-GB": () => import("./en-GB.json"),
} as const;

