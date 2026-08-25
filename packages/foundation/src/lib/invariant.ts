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
