export enum HSTSValidationError {
  MissingHeader = "MissingHeader",
  MissingMaxAge = "MissingMaxAge",
}

export enum HSTSRecommendation {
  MissingIncludeSubDomains = "MissingIncludeSubDomains",
}

export enum ContentSecurityPolicyValidationError {
  MissingHeader = "MissingHeader",
  MissingDefaultSrc = "MissingDefaultSrc",
}
