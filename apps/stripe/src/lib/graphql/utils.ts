import { type Maybe } from "@/lib/types";

const OPERATION_NAME_RE = new RegExp(
  /\b(query|mutation|subscription)\s+([^\s({]+)\s*[{(]/gi,
);

export const getOperationName = (document: string) => {
  const matches = [...document.matchAll(OPERATION_NAME_RE)];

  return matches.map((match) => match[2]).join(", ");
};

interface Edge<T> {
  node: T;
}
interface Connection<T> {
  edges: Maybe<Array<Edge<T>>>;
}

export function mapEdgesToItems<T>(
  data: Maybe<Connection<T>>,
  defaultValue = [],
): T[] {
  return data?.edges?.map(({ node }) => node) ?? defaultValue;
}
