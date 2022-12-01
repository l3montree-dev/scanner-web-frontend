import { config } from "../config";

export const promise2Boolean = async (promise: Promise<any>) => {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
};

export const wait = (delayMS: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMS));
};

export const timeout = async <T>(
  promise: Promise<T>,
  timeoutMS = 3_000
): Promise<T> => {
  const result = await Promise.race([promise, wait(timeoutMS)]);
  if (!result) {
    throw new Error("timeout");
  }
  return result;
};
