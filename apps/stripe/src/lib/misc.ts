export const isObject = (obj: object) => obj.constructor.name === "Object";

export const isEmptyObject = (obj: object) =>
  obj.constructor.name === "Object" && Object.keys(obj).length === 0;
