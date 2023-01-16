// make sure to always execute a function only once.
export const once = <T extends (...args: any) => any>(fn: T): T => {
  let executed = false;
  let result: ReturnType<T>;
  return (async (...args: any) => {
    if (executed) {
      return result;
    }
    executed = true;
    result = await fn(...args);
    return result;
  }) as T;
};
