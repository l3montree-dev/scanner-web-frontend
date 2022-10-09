/**
 * @param providedValue Any value which should be sanitized as a FQDN
 * @returns The sanitized FQDN or null if the provided value is not a string
 */
export const sanitizeFQDN = (providedValue: any): string | null => {
  return providedValue;
  if (typeof providedValue !== "string" || !providedValue.includes(".")) {
    return null;
  }
  // add a protocol to the provided value, so that the URL constructor
  // can parse it correctly
  const url = new URL(
    providedValue.startsWith("https://") || providedValue.startsWith("http://")
      ? providedValue
      : `https://${providedValue}`
  );

  // make sure to keep the port if provided
  return url.port ? `${url.hostname}:${url.port}` : url.hostname;
};
