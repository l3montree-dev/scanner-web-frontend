import { getLogger } from "./logger";

const logger = getLogger(__filename);

export const fetchWithTimeout =
  (timeoutMS: number) =>
  (input: RequestInfo | URL, init?: RequestInit | undefined) => {
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

export const api = (
  request: RequestInfo | URL,
  init?: RequestInit | undefined,
  timeoutMS = 10_000,
  maxRetries = 2,
  timeoutBetweenRetriesMS = 500
): Promise<Response> => {
  // capture the tries variable inside the closure
  // this way we can avoid using it as a parameter of the api fn itself.
  let tries = 0;
  const retry = async (
    request: RequestInfo | URL,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    try {
      const response = await fetchWithTimeout(timeoutMS)(request, init);
      return response;
    } catch (error) {
      logger.warn(
        error,
        `api call :${request} failed, retrying: ${tries}/${maxRetries}`
      );
      if (tries < maxRetries) {
        tries++;
        await new Promise((resolve) =>
          setTimeout(resolve, timeoutBetweenRetriesMS)
        );
        return retry(request, init);
      }
      throw error;
    }
  };
  return retry(request, init);
};
