export const maskString = ({
  str,
  maskChar = "*",
  maxLength,
  visibleChars = 5,
}: {
  maskChar?: string;
  maxLength?: number;
  str: string;
  visibleChars?: number;
}) => {
  const visible = visibleChars === 0 ? "" : str.slice(-visibleChars);
  const length = Math.min(maxLength ?? str.length, str.length);

  return maskChar.repeat(Math.max(0, length - visible.length)) + visible;
};
