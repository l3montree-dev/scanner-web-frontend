-- AlterTable
ALTER TABLE `ScanReport` ADD COLUMN `CAA` BOOLEAN NULL,
    ADD COLUMN `CertificateTransparency` BOOLEAN NULL,
    ADD COLUMN `ContentSecurityPolicy` BOOLEAN NULL,
    ADD COLUMN `ContentTypeOptions` BOOLEAN NULL,
    ADD COLUMN `DNSSec` BOOLEAN NULL,
    ADD COLUMN `HSTS` BOOLEAN NULL,
    ADD COLUMN `HSTSPreloaded` BOOLEAN NULL,
    ADD COLUMN `HTTP` BOOLEAN NULL,
    ADD COLUMN `HTTP308` BOOLEAN NULL,
    ADD COLUMN `HTTPRedirectsToHttps` BOOLEAN NULL,
    ADD COLUMN `HTTPS` BOOLEAN NULL,
    ADD COLUMN `IPv6` BOOLEAN NULL,
    ADD COLUMN `MatchesHostname` BOOLEAN NULL,
    ADD COLUMN `NoMixedContent` BOOLEAN NULL,
    ADD COLUMN `NotRevoked` BOOLEAN NULL,
    ADD COLUMN `RPKI` BOOLEAN NULL,
    ADD COLUMN `ResponsibleDisclosure` BOOLEAN NULL,
    ADD COLUMN `SecureSessionCookies` BOOLEAN NULL,
    ADD COLUMN `StrongCipherSuites` BOOLEAN NULL,
    ADD COLUMN `StrongKeyExchange` BOOLEAN NULL,
    ADD COLUMN `StrongPrivateKey` BOOLEAN NULL,
    ADD COLUMN `StrongSignatureAlgorithm` BOOLEAN NULL,
    ADD COLUMN `SubResourceIntegrity` BOOLEAN NULL,
    ADD COLUMN `TLSv1_1_Deactivated` BOOLEAN NULL,
    ADD COLUMN `TLSv1_2` BOOLEAN NULL,
    ADD COLUMN `TLSv1_3` BOOLEAN NULL,
    ADD COLUMN `ValidCertificate` BOOLEAN NULL,
    ADD COLUMN `ValidCertificateChain` BOOLEAN NULL,
    ADD COLUMN `XFrameOptions` BOOLEAN NULL,
    ADD COLUMN `XSSProtection` BOOLEAN NULL,
    MODIFY `details` JSON NULL;

-- CreateIndex
CREATE INDEX `ScanReport_SubResourceIntegrity_idx` ON `ScanReport`(`SubResourceIntegrity`);

-- CreateIndex
CREATE INDEX `ScanReport_NoMixedContent_idx` ON `ScanReport`(`NoMixedContent`);

-- CreateIndex
CREATE INDEX `ScanReport_ResponsibleDisclosure_idx` ON `ScanReport`(`ResponsibleDisclosure`);

-- CreateIndex
CREATE INDEX `ScanReport_DNSSec_idx` ON `ScanReport`(`DNSSec`);

-- CreateIndex
CREATE INDEX `ScanReport_CAA_idx` ON `ScanReport`(`CAA`);

-- CreateIndex
CREATE INDEX `ScanReport_IPv6_idx` ON `ScanReport`(`IPv6`);

-- CreateIndex
CREATE INDEX `ScanReport_RPKI_idx` ON `ScanReport`(`RPKI`);

-- CreateIndex
CREATE INDEX `ScanReport_HTTP_idx` ON `ScanReport`(`HTTP`);

-- CreateIndex
CREATE INDEX `ScanReport_HTTP308_idx` ON `ScanReport`(`HTTP308`);

-- CreateIndex
CREATE INDEX `ScanReport_HTTPRedirectsToHttps_idx` ON `ScanReport`(`HTTPRedirectsToHttps`);

-- CreateIndex
CREATE INDEX `ScanReport_HTTPS_idx` ON `ScanReport`(`HTTPS`);

-- CreateIndex
CREATE INDEX `ScanReport_HSTS_idx` ON `ScanReport`(`HSTS`);

-- CreateIndex
CREATE INDEX `ScanReport_HSTSPreloaded_idx` ON `ScanReport`(`HSTSPreloaded`);

-- CreateIndex
CREATE INDEX `ScanReport_ContentSecurityPolicy_idx` ON `ScanReport`(`ContentSecurityPolicy`);

-- CreateIndex
CREATE INDEX `ScanReport_XFrameOptions_idx` ON `ScanReport`(`XFrameOptions`);

-- CreateIndex
CREATE INDEX `ScanReport_XSSProtection_idx` ON `ScanReport`(`XSSProtection`);

-- CreateIndex
CREATE INDEX `ScanReport_ContentTypeOptions_idx` ON `ScanReport`(`ContentTypeOptions`);

-- CreateIndex
CREATE INDEX `ScanReport_SecureSessionCookies_idx` ON `ScanReport`(`SecureSessionCookies`);

-- CreateIndex
CREATE INDEX `ScanReport_TLSv1_2_idx` ON `ScanReport`(`TLSv1_2`);

-- CreateIndex
CREATE INDEX `ScanReport_TLSv1_3_idx` ON `ScanReport`(`TLSv1_3`);

-- CreateIndex
CREATE INDEX `ScanReport_TLSv1_1_Deactivated_idx` ON `ScanReport`(`TLSv1_1_Deactivated`);

-- CreateIndex
CREATE INDEX `ScanReport_StrongKeyExchange_idx` ON `ScanReport`(`StrongKeyExchange`);

-- CreateIndex
CREATE INDEX `ScanReport_StrongCipherSuites_idx` ON `ScanReport`(`StrongCipherSuites`);

-- CreateIndex
CREATE INDEX `ScanReport_ValidCertificate_idx` ON `ScanReport`(`ValidCertificate`);

-- CreateIndex
CREATE INDEX `ScanReport_StrongPrivateKey_idx` ON `ScanReport`(`StrongPrivateKey`);

-- CreateIndex
CREATE INDEX `ScanReport_StrongSignatureAlgorithm_idx` ON `ScanReport`(`StrongSignatureAlgorithm`);

-- CreateIndex
CREATE INDEX `ScanReport_MatchesHostname_idx` ON `ScanReport`(`MatchesHostname`);

-- CreateIndex
CREATE INDEX `ScanReport_NotRevoked_idx` ON `ScanReport`(`NotRevoked`);

-- CreateIndex
CREATE INDEX `ScanReport_CertificateTransparency_idx` ON `ScanReport`(`CertificateTransparency`);

-- CreateIndex
CREATE INDEX `ScanReport_ValidCertificateChain_idx` ON `ScanReport`(`ValidCertificateChain`);
