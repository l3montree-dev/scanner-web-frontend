import {
  faCheck,
  faQuestion,
  faTimes,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  InspectionTypeEnum,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import tinycolor from "tinycolor2";

export enum CheckResult {
  Passed = "passed",
  Failed = "failed",
  Critical = "critical",
  Unknown = "unknown",
}

export const didPass2CheckResult = (didPass?: boolean | null) => {
  switch (didPass) {
    case true:
      return CheckResult.Passed;
    case false:
      return CheckResult.Failed;
    default:
      return CheckResult.Unknown;
  }
};

export const checkResult2BorderClassName = (checkResult: CheckResult) => {
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

export const checkResult2TextClassName = (checkResult: CheckResult) => {
  switch (checkResult) {
    case CheckResult.Passed:
      return checkResult2BorderClassName(checkResult);
    case CheckResult.Failed:
      return checkResult2BorderClassName(checkResult);
    case CheckResult.Critical:
      return checkResult2BorderClassName(checkResult);
    default:
      return "white";
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

export const optimisticUpdate = <T>(
  currentState: T,
  setStateFn: (fn: (prev: T) => T) => void,
  transformer: (currentState: T) => T
) => {
  const oldState = currentState;
  setStateFn(transformer);
  // return the reverting function
  return () => setStateFn(() => oldState);
};

export const displayInspections: Array<InspectionType> = [
  OrganizationalInspectionType.ResponsibleDisclosure,
  TLSInspectionType.TLSv1_3,
  TLSInspectionType.DeprecatedTLSDeactivated,
  HeaderInspectionType.HSTS,
  DomainInspectionType.DNSSec,
  NetworkInspectionType.RPKI,
];

const fullConfig = resolveConfig(tailwindConfig);
export const tailwindColors = (fullConfig.theme as any).colors;

export const secretToShareLink = (secret: string) => {
  return `/auth/sign-in?secret=${secret}`;
};

export const w = () => {
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
};

export const adaptiveTextColorBasedOnContrast = (color: string) => {
  // check if the color is dark
  if (tinycolor(color).isDark()) {
    return "text-white";
  }
  return "text-deepblue-500";
};

export const localizeDefaultCollection = <
  T extends { id: number; title: string; color: string }
>(
  collection: T,
  defaultCollectionId: number,
  username: string
): T => {
  if (collection.id === defaultCollectionId) {
    return {
      ...collection,
      color: tailwindColors.lightning["500"],
      title: username,
    };
  }

  return collection;
};
