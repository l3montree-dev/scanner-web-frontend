import { InspectionResult, InspectionType } from "../inspection/Inspector";

export const errorMessage = (e: unknown) => {
  if (e instanceof Error) {
    return `error message: ${e.message}, cause: ${
      (e.cause as string | undefined) ? e.cause : "unknown"
    }`;
  }
  return "Unknown error";
};

export const buildInspectionError = <
  InspectionT extends Record<string, string>
>(
  inspectionType: InspectionT,
  error: unknown
) => {
  return Object.keys(inspectionType).reduce(
    (acc, key) => ({
      ...acc,
      [key]: new InspectionResult(key as InspectionType, false, {
        error: errorMessage(error),
      }),
    }),
    {} as { [type in keyof InspectionT]: InspectionResult }
  );
};
