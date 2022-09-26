import { CookieInspectionType, InspectionResult } from "../Inspector";

export const SecureSessionCookiesChecker = (response: Response) => {
  const header = response.headers.get("Set-Cookie");
  return new InspectionResult(
    CookieInspectionType.SecureSessionCookies,
    header === null ||
      header
        .split(";")
        // determine which cookie is a session cookie...
        // ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
        .filter((cookie) => !cookie.includes("Expires"))
        .every(
          (cookie) => cookie.includes("Secure") && cookie.includes("HttpOnly")
        ),
    {
      "Set-Cookie": response.headers.get("Set-Cookie"),
    }
  );
};
