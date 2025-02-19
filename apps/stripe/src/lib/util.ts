export class InvariantError extends Error {
  constructor(message = "Invariant error.") {
    super(message);
  }
}

export function invariant(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new InvariantError(message);
  }
}

export const isLocalDomain = (url: string) => {
  const urlObject = new URL(url);

  return ["localhost", "127.0.0.1"].includes(urlObject.hostname);
};
