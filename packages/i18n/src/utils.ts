type AnyMessages = Record<string, unknown>;

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<
  TTarget extends AnyMessages,
  TSource extends AnyMessages,
>(target: TTarget, source: TSource): TTarget & TSource {
  const output: AnyMessages = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = output[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(
        targetValue as AnyMessages,
        sourceValue as AnyMessages,
      );
      continue;
    }

    output[key] = sourceValue;
  }

  return output as TTarget & TSource;
}
