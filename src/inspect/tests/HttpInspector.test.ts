import HttpInspector from "../HttpInspector";
import { InspectionType } from "../Inspector";

describe("HttpInspector test suite", () => {
  it("should be true", () => {
    expect(true).toBe(true);
  });

  it("should pass, if the location header is set correctly", async () => {
    const httpInspector = new HttpInspector(
      jest.fn(async () => {
        return {
          status: 308,
          headers: new Headers({
            location: "https://example.com",
          }),
        } as any;
      })
    );
    const result = await httpInspector.inspect("example.com");
    expect(result.every((r) => r.didPass)).toBe(true);
  });

  it("should fail, if the location header is not set correctly", async () => {
    const httpInspector = new HttpInspector(
      jest.fn(async () => {
        return {
          status: 308,
          headers: new Headers({
            location: "http://example.com",
          }),
        } as any;
      })
    );
    const result = await httpInspector.inspect("example.com");
    expect(
      result[0].subResults?.find(
        (r) => r.type === InspectionType.HTTP_LocationHttps
      )?.didPass
    ).toBe(false);
  });
  it("should fail, if the status code is not 308", async () => {
    const httpInspector = new HttpInspector(
      jest.fn(async () => {
        return {
          status: 200,
          headers: new Headers({
            location: "https://example.com",
          }),
        } as any;
      })
    );
    const result = await httpInspector.inspect("example.com");
    expect(
      result[0].subResults?.find((r) => r.type === InspectionType.HTTP_308)
        ?.didPass
    ).toBe(false);
  });
});
