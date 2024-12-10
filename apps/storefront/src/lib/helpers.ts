export const isValidJson = (value: string) => {
  try {
    JSON.parse(value);

    return true;
  } catch (error) {
    return false;
  }
};
