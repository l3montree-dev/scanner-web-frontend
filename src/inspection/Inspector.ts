export enum ContentInspectionType {
  SubResourceIntegrity = "SubResourceIntegrity",
  NoMixedContent = "NoMixedContent",
}

export enum OrganizationalInspectionType {
  ResponsibleDisclosure = "ResponsibleDisclosure",
}

export enum DomainInspectionType {
  DNSSec = "DNSSec",
  CAA = "CAA",
}

export enum NetworkInspectionType {
  IPv6 = "IPv6",
}

export enum HttpInspectionType {
  HTTP = "HTTP",
  // permanent redirect to https.
  HTTP308 = "HTTP308",
  // redirect to https.
  HTTPRedirectsToHttps = "HTTPRedirectsToHttps",
}

export enum HeaderInspectionType {
  HTTPS = "HTTPS",
  HSTS = "HSTS",
  HSTSPreloaded = "HSTSPreloaded",
  ContentSecurityPolicy = "ContentSecurityPolicy",
  XFrameOptions = "XFrameOptions",
  XSSProtection = "XSSProtection",
  ContentTypeOptions = "ContentTypeOptions",
}

export enum CookieInspectionType {
  SecureSessionCookies = "SecureSessionCookies",
}
export enum TLSInspectionType {
  TLSv1_2 = "TLSv1_2",
  TLSv1_3 = "TLSv1_3",
  SSLDeactivated = "SSLDeactivated",
  // make sure, that TLS v.1.1 and older is not supported
  TLSv1_1_Deactivated = "TLSv1_1_Deactivated",
  // string Key-Exchange (min. 2048 bit for DHE; min. 256 bit for
  // prefer ECDHE
  StrongKeyExchange = "StrongKeyExchange",
  StrongCipherSuites = "StrongCipherSuites",
}

export enum CertificateInspectionType {
  ValidCertificate = "ValidCertificate",
  // EC min. 256 bit, RSA min. 2048 bit
  StrongPrivateKey = "StrongPrivateKey",
  StrongSignatureAlgorithm = "StrongSignatureAlgorithm",
  MatchesHostname = "MatchesHostname",
  NotRevoked = "NotRevoked",
  CertificateTransparency = "CertificateTransparency",
  ValidCertificateChain = "ValidCertificateChain",
}

export type InspectionType =
  | HttpInspectionType
  | TLSInspectionType
  | CertificateInspectionType
  | CookieInspectionType
  | NetworkInspectionType
  | DomainInspectionType
  | OrganizationalInspectionType
  | ContentInspectionType
  | HeaderInspectionType;

export interface InspectResultDTO {
  type: InspectionType;
  didPass: boolean | null;
  actualValue: Record<string, any>;
  errors: string[];
  recommendations: string[];
}

export class InspectionResult {
  constructor(
    public type: InspectionType,
    public didPass: boolean | null,
    public actualValue: Record<string, any>,
    public errors?: string[],
    public recommendations?: string[]
  ) {}

  toDTO(): InspectResultDTO {
    return {
      type: this.type,
      didPass: this.didPass,
      actualValue: this.actualValue,
      errors: this.errors || [],
      recommendations: this.recommendations || [],
    };
  }
}

export interface Inspector<T extends InspectionType, Parameter = string> {
  inspect(
    requestId: string,
    param: Parameter
  ): Promise<{ [key in T]: InspectionResult }>;
}
