const OPERATION_NAME_RE = new RegExp(
  /\b(query|mutation|subscription)\s+([^\s({]+)\s*[{(]/gi,
);

/**
 * Derives the operation name(s) from a GraphQL document string, e.g.
 * `query AppIdQuery { ... }` -> `"AppIdQuery"`.
 */
export const getOperationName = (document: string) => {
  const matches = [...document.matchAll(OPERATION_NAME_RE)];

  return matches.map((match) => match[2]).join(", ");
};
