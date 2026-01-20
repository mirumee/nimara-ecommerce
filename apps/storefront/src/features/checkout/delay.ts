export const delay = async (delay = 1250) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, delay),
  );
