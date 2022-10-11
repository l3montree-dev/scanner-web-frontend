import { wait } from "../utils/promise";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

const fetchWithTimeout = (
  timeoutMS: number,
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => {
  return new Promise<Response>(async (resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      logger.error(
        `fetchWithTimeout: request to ${input} timed out after ${timeoutMS}ms`
      );
    }, timeoutMS);
    // spread the provided parameters.
    // this will overwrite the signal if another one is provided.
    let response: Response;
    try {
      response = await fetch(input, { signal: controller.signal, ...init });
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
  (timeoutMS: number, maxRetries: number, timeoutBetweenRetriesMS = 500) =>
  (
    request: RequestInfo | URL,
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
        const response = await fetchWithTimeout(timeoutMS, request, init);
        return response;
      } catch (error) {
        logger.warn(
          error,
          `api call :${request} failed, retrying: ${tries}/${maxRetries}`
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
