/**
 * A factory: react-hook-form writes into the object it is handed, so a shared
 * one would alias every override that starts out empty.
 */
export const emptyConfig = () => ({ publicKey: "", secretKey: "" });
