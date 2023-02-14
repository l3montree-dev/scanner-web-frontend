import { isValidFqdn } from "./validator";

describe("validator test suite", () => {
  it("should correctly verify a fqdn", () => {
    expect(isValidFqdn("example.com")).toBe(true);
  });
  it("should deny a fqdn with a port", () => {
    expect(isValidFqdn("example.com:8080")).toBe(false);
  });
  it("should deny a fqdn with a path", () => {
    expect(isValidFqdn("example.com/path")).toBe(false);
  });
  it("should deny a fqdn with a query parameter", () => {
    expect(isValidFqdn("example.com?query=param")).toBe(false);
  });
  it("should accept a fqdn that is a subdomain", () => {
    expect(isValidFqdn("subdomain.example.com")).toBe(true);
  });
  it("should deny a fqdn that is an ip", () => {
    expect(isValidFqdn("192.168.178.2")).toBe(false);
  });
  it("should accept a fqdn with a 2 place tld", () => {
    expect(isValidFqdn("example.co.uk")).toBe(true);
  });
});
