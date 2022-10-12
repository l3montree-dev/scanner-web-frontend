import { wait } from "../utils/promise";

interface MultiPlatformLogger {
  error: (obj: any, msg: string) => void;
  warn: (obj: any, msg: string) => void;
}

const fetchWithTimeout = (
  logger: MultiPlatformLogger,
  timeoutMS: number,
  input: RequestInfo | URL,
  requestId: string | undefined,
  init?: RequestInit | undefined
) => {
  return new Promise<Response>(async (resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      logger.error(
        { requestId },
        `fetchWithTimeout: request to ${input} timed out after ${timeoutMS}ms`
      );
    }, timeoutMS);
    // spread the provided parameters.
    // this will overwrite the signal if another one is provided.
    let response: Response;
    try {
      response = await fetch(input, {
        signal: controller.signal,
        redirect: "follow",
        ...init,
        headers: {
          "X-Request-ID": requestId ?? crypto.randomUUID(),
          // set a default user agent.
          // this is required for some sites.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          ...init?.headers,
        },
      });
      clearTimeout(timeout);
      resolve(response);
    } catch (e) {
      // clear the timeout even if there is an error.
      clearTimeout(timeout);
      reject(e);
    }
  });
};

export const httpClientFactory =
  (
    logger: MultiPlatformLogger,
    timeoutMS: number,
    maxRetries: number,
    timeoutBetweenRetriesMS = 500
  ) =>
  (
    request: RequestInfo | URL,
    // needs always to be defined! This makes our logs more readable.
    requestId: string | undefined,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    // capture the tries variable inside the closure
    // this way we can avoid using it as a parameter of the api fn itself.
    let tries = 0;

    const retry = async (
      request: RequestInfo | URL,
      init?: RequestInit | undefined
    ): Promise<Response> => {
      try {
        const response = await fetchWithTimeout(
          logger,
          timeoutMS,
          request,
          requestId,
          init
        );
        return response;
      } catch (error) {
        logger.warn(
          { err: error },
          `api call: ${request} failed, retrying: ${tries + 1}/${maxRetries}`
        );
        if (tries < maxRetries) {
          tries++;
          await wait(timeoutBetweenRetriesMS);
          return retry(request, init);
        }
        throw error;
      }
    };
    return retry(request, init);
  };

export type HttpClient = ReturnType<typeof httpClientFactory>;
