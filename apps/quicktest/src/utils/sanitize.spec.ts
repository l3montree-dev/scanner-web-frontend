import { sanitizeFQDN } from "./common";

describe("sanitize test suite", () => {
  it("should throw an error, if the input is not a string", () => {
    expect(sanitizeFQDN(123 as any)).toEqual(null);
  });
  it("should remove any protocol if provided", () => {
    expect(sanitizeFQDN("https://example.com")).toBe("example.com");
  });
  it("should remove any path if provided", () => {
    expect(sanitizeFQDN("example.com/path")).toBe("example.com");
  });
  it("should remove any query parameters if provided", () => {
    expect(sanitizeFQDN("example.com?query=param")).toBe("example.com");
  });
  it("should remove any hash if provided", () => {
    expect(sanitizeFQDN("example.com#hash")).toBe("example.com");
  });
  it("should not remove any port if provided", () => {
    expect(sanitizeFQDN("192.168.0.1:8080")).toBe("192.168.0.1:8080");
  });
  it("should work for subdomains", () => {
    expect(sanitizeFQDN("subdomain.example.com")).toBe("subdomain.example.com");
  });
});
