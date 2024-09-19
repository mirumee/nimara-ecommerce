import identity from "lodash/identity";
import pickBy from "lodash/pickBy";

export const cleanObject = <T extends Record<string, unknown>>(obj: T) =>
  pickBy(obj, identity);

export const delay = async (delay = 1250) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, delay),
  );
