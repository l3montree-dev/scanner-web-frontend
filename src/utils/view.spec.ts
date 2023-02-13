import {
  CheckResult,
  checkResult2ColorClassName,
  checkResult2Icon,
  didPass2CheckResult,
} from "./view";

describe("view test suite", () => {
  it("should overwrite the didPass value as critical if the overwriteAsCritical is true", () => {
    const didPass = true;
    const overwriteAsCritical = true;
    const result = didPass2CheckResult(didPass, overwriteAsCritical);
    expect(result).toEqual(CheckResult.Critical);
  });

  it.each([
    [true, CheckResult.Passed],
    [false, CheckResult.Failed],
    [undefined, CheckResult.Unknown],
    [null, CheckResult.Unknown],
  ])(
    "should correctly transform a didPass value to a check result managed by the frontend",
    (param, expected) => {
      const result = didPass2CheckResult(param);
      expect(result).toEqual(expected);
    }
  );

  it.each([
    [CheckResult.Passed, "lightning-500"],
    [CheckResult.Failed, "yellow-500"],
    [CheckResult.Critical, "red-500"],
    [CheckResult.Unknown, "gray-500"],
  ])(
    "should transform a checkResult to the correct tailwind classname",
    (param, expected) => {
      const result = checkResult2ColorClassName(param);
      expect(result).toEqual(expected);
    }
  );

  it.each([
    [CheckResult.Passed, "check"],
    [CheckResult.Failed, "triangle-exclamation"],
    [CheckResult.Critical, "xmark"],
    [CheckResult.Unknown, "question"],
  ])(
    "should transform a checkResult to the correct icon",
    (param, expected) => {
      const result = checkResult2Icon(param);
      expect(result.iconName).toEqual(expected);
    }
  );
});
