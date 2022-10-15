import { includesOnce, validationHelper } from "./validationHelper";

describe("Validation Helper Test suite", () => {
  it("should mark didPass as true, if there are no errors", () => {
    const { didPass } = validationHelper({ a: () => true, b: () => true });
    expect(didPass).toBe(true);
  });
  it("should mark didPass as false, if there are errors", () => {
    const { didPass } = validationHelper({ a: () => false, b: () => true });
    expect(didPass).toBe(false);
  });

  it("should include all elements into the error string array, if the predicate return false", () => {
    const { errors } = validationHelper({
      a: () => false,
      b: () => false,
      c: () => true,
    });
    expect(errors).toEqual(["a", "b"]);
  });
  it("should include all elements into the recommendations string array, if the predicate return false", () => {
    const { recommendations } = validationHelper(
      { a: () => true, b: () => true },
      { c: () => false, d: () => true }
    );
    expect(recommendations).toEqual(["c"]);
  });
  it("should return true, if the substring is included exactly once", () => {
    expect(includesOnce("abc", "a")).toBe(true);
  });
  it("should return false, if the substring is not included", () => {
    expect(includesOnce("abc", "d")).toBe(false);
  });
  it("should return false if the substring is included twice", () => {
    expect(includesOnce("abcabc", "a")).toBe(false);
  });
});
