export const getRequestOrigin = (request: Request) => {
  const protocol = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host");

  if (protocol && host) {
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
};
