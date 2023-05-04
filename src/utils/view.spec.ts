import {
  CheckResult,
  checkResult2BorderClassName,
  checkResult2Icon,
  didPass2CheckResult,
} from "./view";

describe("view test suite", () => {
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
    [CheckResult.Passed, "dunkelgruen-80"],
    [CheckResult.Failed, "hellorange-100"],
    [CheckResult.Critical, "rot-100"],
    [CheckResult.Unknown, "dunkelgrau-100"],
  ])(
    "should transform a checkResult to the correct tailwind classname",
    (param, expected) => {
      const result = checkResult2BorderClassName(param);
      expect(result).toEqual(expected);
    }
  );

  it.each([
    [CheckResult.Passed, "circle-check"],
    [CheckResult.Failed, "circle-exclamation"],
    [CheckResult.Critical, "circle-xmark"],
    [CheckResult.Unknown, "circle-xmark"],
  ])(
    "should transform a checkResult to the correct icon",
    (param, expected) => {
      const result = checkResult2Icon(param);
      expect(result.iconName).toEqual(expected);
    }
  );
});
