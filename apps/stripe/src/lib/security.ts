export const maskString = ({
  str,
  maskChar = "*",
  visibleChars = 5,
}: {
  maskChar?: string;
  str: string;
  visibleChars?: number;
}) => {
  return maskChar.repeat(str.length - visibleChars) + str.slice(-visibleChars);
};
