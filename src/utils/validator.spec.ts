import { isValidHostname } from "./validator";

describe("validator test suite", () => {
  it("should correctly verify a fqdn", () => {
    expect(isValidHostname("example.com")).toBe(true);
  });
  it("should deny a fqdn with a port", () => {
    expect(isValidHostname("example.com:8080")).toBe(false);
  });
  it("should deny a fqdn with a path", () => {
    expect(isValidHostname("example.com/path")).toBe(false);
  });
  it("should deny a fqdn with a query parameter", () => {
    expect(isValidHostname("example.com?query=param")).toBe(false);
  });
  it("should accept a fqdn that is a subdomain", () => {
    expect(isValidHostname("subdomain.example.com")).toBe(true);
  });
  it("should deny a fqdn that is an ip", () => {
    expect(isValidHostname("192.168.178.2")).toBe(false);
  });
  it("should accept a fqdn with a 2 place tld", () => {
    expect(isValidHostname("example.co.uk")).toBe(true);
  });
  it("should allow domain names with 7 characters as tld", () => {
    expect(isValidHostname("example.digital")).toBe(true);
  });
});
