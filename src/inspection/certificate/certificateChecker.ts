import { X509Certificate } from "crypto";
import { DetailedPeerCertificate } from "tls";
import { CertificateInspectionType, InspectionResult } from "../Inspector";

export const isValidChecker = (
  certificate: DetailedPeerCertificate
): InspectionResult => {
  return new InspectionResult(
    CertificateInspectionType.ValidCertificate,
    new Date(certificate.valid_from).getTime() < Date.now() &&
      new Date(certificate.valid_to).getTime() > Date.now(),
    {
      valid_from: certificate.valid_from,
      valid_to: certificate.valid_to,
    }
  );
};

export const isNotRevokedChecker = (certificate: DetailedPeerCertificate) => {};

export const isValidCertificateChainChecker = (
  certificate: DetailedPeerCertificate
) => {
  let currentCertificate = certificate;
  while (
    currentCertificate.issuerCertificate &&
    currentCertificate !== currentCertificate.issuerCertificate
  ) {
    if (
      new Date(currentCertificate.valid_from).getTime() > Date.now() ||
      new Date(currentCertificate.valid_to).getTime() < Date.now()
    ) {
      return new InspectionResult(
        CertificateInspectionType.ValidCertificateChain,
        false,
        {
          subject: currentCertificate.subject,
          issuer: currentCertificate.issuer,
          valid_from: currentCertificate.valid_from,
          valid_to: currentCertificate.valid_to,
          reason: "Certificate is not valid",
        }
      );
    }
    // check if the certificate is signed by the issuer pubKey.
    // if not, the certificate is not valid.
    const x509 = new X509Certificate(currentCertificate.raw);
    const issuerX509 = new X509Certificate(
      currentCertificate.issuerCertificate.raw
    );

    if (!x509.verify(issuerX509.publicKey)) {
      return new InspectionResult(
        CertificateInspectionType.ValidCertificateChain,
        false,
        {
          subject: currentCertificate.subject,
          issuer: currentCertificate.issuer,
          valid_from: currentCertificate.valid_from,
          valid_to: currentCertificate.valid_to,
          reason: "Certificate is not signed by issuer",
        }
      );
    }
    currentCertificate = currentCertificate.issuerCertificate;
  }
  return new InspectionResult(
    CertificateInspectionType.ValidCertificateChain,
    true,
    {}
  );
};

export const matchesHostnameChecker = (
  certificate: DetailedPeerCertificate,
  fqdn: string
) => {
  return new InspectionResult(
    CertificateInspectionType.MatchesHostname,
    certificate.subject.CN === fqdn,
    {
      subject: certificate.subject,
    }
  );
};

export const isStrongPrivateKeyChecker = (
  certificate: DetailedPeerCertificate
) => {
  const x509 = new X509Certificate(certificate.raw);
  const key = x509.publicKey;
  const type = key.asymmetricKeyType;
  const details = key.asymmetricKeyDetails;
  return new InspectionResult(
    CertificateInspectionType.StrongPrivateKey,
    (!!details && (details.modulusLength ?? 0) >= 2048 && type === "rsa") ||
      type === "dsa",
    {
      type,
      size: details?.modulusLength,
    }
  );
};
