export enum ResponsibleDisclosureValidationError {
  MissingResponsibleDisclosure = "MissingResponsibleDisclosure",
  MissingContactField = "MissingContactField",
  InvalidExpiresField = "InvalidExpiresField",
  Expired = "Expired",
}

// invalid means either missing or twice included
export enum ResponsibleDisclosureRecommendation {
  InvalidEncryption = "InvalidEncryption",
  InvalidCanonical = "InvalidCanonical",
  InvalidPreferredLanguages = "InvalidPreferredLanguages",
  MissingPGPSignature = "MissingPGPSignature",
}
