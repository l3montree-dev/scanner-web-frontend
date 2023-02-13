import {
  faCheck,
  faQuestion,
  faTimes,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";

export enum CheckResult {
  Passed = "passed",
  Failed = "failed",
  Critical = "critical",
  Unknown = "unknown",
}

export const didPass2CheckResult = (
  didPass?: boolean | null,
  overwriteAsCritical = false
) => {
  if (overwriteAsCritical) {
    return CheckResult.Critical;
  }

  switch (didPass) {
    case true:
      return CheckResult.Passed;
    case false:
      return CheckResult.Failed;
    default:
      return CheckResult.Unknown;
  }
};

export const checkResult2ColorClassName = (checkResult: CheckResult) => {
  switch (checkResult) {
    case CheckResult.Passed:
      return "lightning-500";
    case CheckResult.Failed:
      return "yellow-500";
    case CheckResult.Critical:
      return "red-500";
    default:
      return "gray-500";
  }
};

export const checkResult2Icon = (checkResult: CheckResult) => {
  switch (checkResult) {
    case CheckResult.Passed:
      return faCheck;
    case CheckResult.Failed:
      return faWarning;
    case CheckResult.Critical:
      return faTimes;
    default:
      return faQuestion;
  }
};
