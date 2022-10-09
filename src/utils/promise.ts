export const promise2Boolean = async (promise: Promise<any>) => {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
};
