export const getRequestOrigin = (request: Request) => {
  const protocol = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host");

  if (protocol && host) {
    const origin = `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`;

    return origin;
  }

  return new URL(request.url).origin;
};
