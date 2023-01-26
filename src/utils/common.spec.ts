import { splitLineBreak } from "./common";

describe("common test suite", () => {
  it("should respect windows line breaks inside a csv file", () => {
    const data = `domain1.com\r\ndomain2.com`;
    const entries = splitLineBreak(data);
    expect(entries[0]).toEqual("domain1.com");
    expect(entries[1]).toEqual("domain2.com");
  });

  it("should respect unix line breaks inside a csv file", () => {
    const data = `domain1.com\ndomain2.com`;
    const entries = splitLineBreak(data);
    expect(entries[0]).toEqual("domain1.com");
    expect(entries[1]).toEqual("domain2.com");
  });

  it("should respect /r line breaks inside a csv file", () => {
    const data = `domain1.com\rdomain2.com`;
    const entries = splitLineBreak(data);
    expect(entries[0]).toEqual("domain1.com");
    expect(entries[1]).toEqual("domain2.com");
  });

  it("should remove leading and trailing white spaces", () => {
    const data = `domain1.com\ndomain2.com `;
    const entries = splitLineBreak(data);
    expect(entries[0]).toEqual("domain1.com");
    expect(entries[1]).toEqual("domain2.com");
  });
});
