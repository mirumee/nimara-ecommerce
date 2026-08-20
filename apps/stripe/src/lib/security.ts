export const maskString = ({
  str,
  maskChar = "*",
  visibleChars = 5,
}: {
  maskChar?: string;
  str: string;
  visibleChars?: number;
}) => {
  if (visibleChars === 0) {
    return maskChar.repeat(str.length);
  }

  return maskChar.repeat(str.length - visibleChars) + str.slice(-visibleChars);
};
