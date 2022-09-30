export const api = (
  request: RequestInfo,
  maxRetries = 2,
  timeoutBetweenRetriesMS = 500
): Promise<Response> => {
  // capture the tries variable inside the closure
  // this way we can avoid using it as a parameter of the api fn itself.
  let tries = 0;
  const retry = async (request: RequestInfo): Promise<Response> => {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      if (tries < maxRetries) {
        tries++;
        await new Promise((resolve) =>
          setTimeout(resolve, timeoutBetweenRetriesMS)
        );
        return retry(request);
      }
      throw error;
    }
  };
  return retry(request);
};
