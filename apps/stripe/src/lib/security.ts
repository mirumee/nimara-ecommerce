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

  if (visibleChars >= str.length) {
    return str;
  }

  return maskChar.repeat(str.length - visibleChars) + str.slice(-visibleChars);
};
