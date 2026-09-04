export const isLocalDomain = (url: string) => {
  const urlObject = new URL(url);

  return ["localhost", "127.0.0.1"].includes(urlObject.hostname);
};
