import { GetServerSidePropsContext } from "next";
import { AuthOptions, unstable_getServerSession } from "next-auth";
import { Stream } from "stream";
import { ISession } from "../types";

export const getServerSession = (
  req: GetServerSidePropsContext["req"],
  res: GetServerSidePropsContext["res"],
  options: AuthOptions
): Promise<ISession | null> => {
  return unstable_getServerSession(req, res, options);
};

type Extract<T extends ReadonlyArray<() => Promise<any>>> = {
  [Index in keyof T]: T[Index] extends () => Promise<infer V> ? V : never;
};

// Limit the concurrency of an array of promises.
// might be useful to scan some more restrictive websites.
export const promiseExecutor = <T extends ReadonlyArray<() => Promise<any>>>(
  promiseFactories: T,
  // -1 unlimited.
  concurrency = -1
): Promise<Extract<T>> => {
  if (concurrency === -1) {
    return Promise.all(promiseFactories.map((f) => f())) as Promise<Extract<T>>;
  }
  return new Promise<Extract<T>>(async (resolve) => {
    const results: Array<{ index: number; value: Promise<any> }> = [];
    const queue: Array<PromiseLike<any>> = [];
    let ongoing = 0;

    for (let i = 0; i < promiseFactories.length; i++) {
      if (ongoing >= concurrency) {
        // no busy waiting - let them race against each other
        // if the first promise resolves, we can start another one.
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
    resolve(
      results.sort((a, b) => a.index - b.index).map((r) => r.value) as any
    );
  });
};

export async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}
