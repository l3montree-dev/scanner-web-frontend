import { config } from "../config";
import { wait } from "../utils/promise";

import { getLogger } from "./logger";

const logger = getLogger(__filename);

const fetchWithTimeout = (
  timeoutMS: number,
  input: RequestInfo | URL,
  requestId: string,
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
          //    "X-Request-ID": requestId,
          // pick a random user agent
          // this is required for some sites.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
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

export const httpClientFactory = () => {
  // store the cookie in this closure
  let cookie: null | string = null;
  return (
    request: RequestInfo | URL,
    // needs always to be defined! This makes our logs more readable.
    requestId: string,
    init?: RequestInit | undefined,
    options: {
      setCookies?: boolean;
      timeoutMS?: number;
      maxRetries?: number;
      timeoutBetweenRetriesMS?: number;
    } = {
      timeoutMS: config.serverTimeout,
      maxRetries: config.serverRetries,
      setCookies: true,
      timeoutBetweenRetriesMS: 500,
    }
  ): Promise<Response> => {
    // capture the tries variable inside the closure
    // this way we can avoid using it as a parameter of the api fn itself.
    let tries = 0;
    const setCookies = options.setCookies ?? false;
    const timeoutMS = options.timeoutMS ?? config.serverTimeout;
    const maxRetries = options.maxRetries ?? config.serverRetries;
    const timeoutBetweenRetriesMS = options.timeoutBetweenRetriesMS ?? 500;

    const retry = async (
      request: RequestInfo | URL,
      init?: RequestInit | undefined
    ): Promise<Response> => {
      try {
        if (init?.credentials !== "omit" && cookie) {
          // set the cookie header
          init = {
            ...init,
            headers: {
              ...init?.headers,
              cookie,
            },
          };
        }
        const response = await fetchWithTimeout(
          timeoutMS,
          request,
          requestId,
          init
        );
        if (setCookies) {
          // if the sanity check is enabled, we need to make sure, that the response is valid and we save the cookies.
          cookie = response.headers.get("set-cookie");
        }
        return response;
      } catch (error) {
        if (tries < maxRetries) {
          tries++;
          logger.warn(
            { err: error },
            `api call: ${request} failed, retrying: ${tries}/${maxRetries}`
          );
          await wait(timeoutBetweenRetriesMS);
          return retry(request, init);
        }
        throw error;
      }
    };
    return retry(request, init);
  };
};

export type ServerHttpClient = ReturnType<typeof httpClientFactory>;
