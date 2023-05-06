export enum ResponsibleDisclosureValidationError {
  MissingResponsibleDisclosure = "missingResponsibleDisclosure",
  MissingContactField = "missingContactField",
  InvalidExpiresField = "invalidExpiresField",
  Expired = "expired",
  MissingExpiresField = "missingExpiresField",
}

// invalid means either missing or twice included
export enum ResponsibleDisclosureRecommendation {
  InvalidEncryption = "invalidEncryption",
  InvalidCanonical = "invalidCanonical",
  InvalidPreferredLanguages = "invalidPreferredLanguages",
  MissingPGPSignature = "missingPGPSignature",
}
