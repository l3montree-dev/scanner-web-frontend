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
  timeoutMS = config.serverTimeout
): Promise<T> => {
  const result = await Promise.race([promise, wait(timeoutMS)]);
  if (result === undefined) {
    throw new Error("timeout");
  }
  return result;
};

// Limit the concurrency of an array of promises.
// might be useful to scan some more restrictive websites.
export const promiseExecutor = <T>(
  promiseFactories: Array<() => T | PromiseLike<T>>,
  concurrency: number
): Promise<T[]> => {
  return new Promise<T[]>(async (resolve) => {
    const results: Array<{ index: number; value: T }> = [];
    const queue: Array<PromiseLike<any>> = [];
    let ongoing = 0;

    for (let i = 0; i < promiseFactories.length; i++) {
      if (ongoing >= concurrency) {
        // no busy waiting - let them race against each other
        // if the first prmise resolves, we can start another one.
        const res = await Promise.race(queue);
        queue.splice(queue.indexOf(res), 1);
      }

      const promise = promiseFactories[i]();
      if ("then" in promise) {
        ongoing++;
        // just push the promise inside the promises array
        // we only need them to race against each other - the order does not matter.
        queue.push(promise);
        promise.then((result) => {
          results.push({ value: result, index: i });
          ongoing--;
        });
      } else {
        results.push({ value: promise, index: i });
      }
    }

    // wait for all concurrent promises to resolve.
    await Promise.all(queue);
    resolve(results.sort((a, b) => a.index - b.index).map((r) => r.value));
  });
};
