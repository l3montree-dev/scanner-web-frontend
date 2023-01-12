import { Prisma, PrismaClient, User } from "@prisma/client";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { toDTO } from "../utils/server";

const getTotalsOfUser = async (user: User, prisma: PrismaClient) => {
  // count the domains this user has access to
  return {
    uniqueDomains: await prisma.userDomainRelation.count({
      where: {
        userId: user.id,
      },
    }),
  };
};

const getTotals = async (
  prisma: PrismaClient
): Promise<{ uniqueDomains: number }> => {
  return {
    uniqueDomains: await prisma.domain.count(),
  };
};

const getCurrentStatePercentage = async (
  user: User,
  prisma: PrismaClient
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  let [res] = (await prisma.$queryRaw(
    Prisma.sql`
SELECT AVG(SubResourceIntegrity) as SubResourceIntegrity,
AVG(NoMixedContent) as NoMixedContent,
AVG(ResponsibleDisclosure) as ResponsibleDisclosure,
AVG(DNSSec) as DNSSec,
AVG(CAA) as CAA,
AVG(IPv6) as IPv6,
AVG(RPKI) as RPKI,
AVG(HTTP) as HTTP,
AVG(HTTP308) as HTTP308,
AVG(HTTPRedirectsToHttps) as HTTPRedirectsToHttps,
AVG(HSTS) as HSTS, 
AVG(HSTSPreloaded) as HSTSPreloaded,
AVG(ContentSecurityPolicy) as ContentSecurityPolicy,
AVG(XFrameOptions) as XFrameOptions,
AVG(XSSProtection) as XSSProtection,
AVG(ContentTypeOptions) as ContentTypeOptions,
AVG(SecureSessionCookies) as SecureSessionCookies,
AVG(TLSv1_2) as TLSv1_2,
AVG(TLSv1_3) as TLSv1_3, 
AVG(TLSv1_1_Deactivated) as TLSv1_1_Deactivated, 
AVG(StrongKeyExchange) as StrongKeyExchange,
AVG(StrongCipherSuites) as StrongCipherSuites,
AVG(ValidCertificate) as ValidCertificate,
AVG(StrongPrivateKey) as StrongPrivateKey,
AVG(StrongSignatureAlgorithm) as StrongSignatureAlgorithm,
AVG(MatchesHostname) as MatchesHostname,
AVG(NotRevoked) as NotRevoked,
AVG(CertificateTransparency) as CertificateTransparency,
AVG(ValidCertificateChain) as ValidCertificateChain,

COUNT(*) as totalCount
      from user_domain_relations udr INNER JOIN scan_reports sr1 on udr.fqdn = sr1.fqdn
        WHERE NOT EXISTS(
          SELECT 1 from scan_reports sr2 where sr1.fqdn = sr2.fqdn AND sr1.createdAt > sr2.createdAt
    ) AND udr.userId = ${user.id}`
  )) as any;

  res = toDTO(res);

  const { totalCount, ...data } = res;
  return {
    totalCount,
    data,
  };
};
const getFailedSuccessPercentage = async (
  user: User,
  prisma: PrismaClient,
  timeQuery: {
    end: number;
  }
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  let [res] = (await prisma.$queryRaw(
    Prisma.sql`
    SELECT AVG(SubResourceIntegrity) as SubResourceIntegrity,
    AVG(NoMixedContent) as NoMixedContent,
    AVG(ResponsibleDisclosure) as ResponsibleDisclosure,
    AVG(DNSSec) as DNSSec,
    AVG(CAA) as CAA,
    AVG(IPv6) as IPv6,
    AVG(RPKI) as RPKI,
    AVG(HTTP) as HTTP,
    AVG(HTTP308) as HTTP308,
    AVG(HTTPRedirectsToHttps) as HTTPRedirectsToHttps,
    AVG(HSTS) as HSTS, 
    AVG(HSTSPreloaded) as HSTSPreloaded,
    AVG(ContentSecurityPolicy) as ContentSecurityPolicy,
    AVG(XFrameOptions) as XFrameOptions,
    AVG(XSSProtection) as XSSProtection,
    AVG(ContentTypeOptions) as ContentTypeOptions,
    AVG(SecureSessionCookies) as SecureSessionCookies,
    AVG(TLSv1_2) as TLSv1_2,
    AVG(TLSv1_3) as TLSv1_3, 
    AVG(TLSv1_1_Deactivated) as TLSv1_1_Deactivated, 
    AVG(StrongKeyExchange) as StrongKeyExchange,
    AVG(StrongCipherSuites) as StrongCipherSuites,
    AVG(ValidCertificate) as ValidCertificate,
    AVG(StrongPrivateKey) as StrongPrivateKey,
    AVG(StrongSignatureAlgorithm) as StrongSignatureAlgorithm,
    AVG(MatchesHostname) as MatchesHostname,
    AVG(NotRevoked) as NotRevoked,
    AVG(CertificateTransparency) as CertificateTransparency,
    AVG(ValidCertificateChain) as ValidCertificateChain,
    
    COUNT(*) as totalCount
          from user_domain_relations udr INNER JOIN scan_reports sr1 on udr.fqdn = sr1.fqdn
          WHERE NOT EXISTS(
              SELECT 1 from scan_reports sr2 where sr1.fqdn = sr2.fqdn AND sr1.createdAt > sr2.createdAt
        ) AND udr.userId = ${user.id} AND sr1.createdAt < ${new Date(
      timeQuery.end
    )}`
  )) as any;

  res = toDTO(res);

  const { totalCount, ...data } = res;
  return {
    totalCount,
    data,
  };
};

export const statService = {
  getTotals,
  getTotalsOfUser,
  getCurrentStatePercentage,
  getFailedSuccessPercentage,
};
