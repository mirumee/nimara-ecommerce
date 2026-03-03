export const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  // Keep only first and last two characters visible.
  if (localPart.length <= 4) {
    return `${"*".repeat(localPart.length)}@${domain}`;
  }

  const prefix = localPart.slice(0, 2);
  const suffix = localPart.slice(-2);
  const hidden = "*".repeat(localPart.length - 4);

  return `${prefix}${hidden}${suffix}@${domain}`;
};
