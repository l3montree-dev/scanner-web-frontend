/*
  Warnings:

  - You are about to drop the `Dashboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Network` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScanReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserDomainRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Dashboard` DROP FOREIGN KEY `Dashboard_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ScanReport` DROP FOREIGN KEY `ScanReport_fqdn_fkey`;

-- DropForeignKey
ALTER TABLE `UserDomainRelation` DROP FOREIGN KEY `UserDomainRelation_domainId_fkey`;

-- DropForeignKey
ALTER TABLE `UserDomainRelation` DROP FOREIGN KEY `UserDomainRelation_userId_fkey`;

-- DropTable
DROP TABLE `Dashboard`;

-- DropTable
DROP TABLE `Domain`;

-- DropTable
DROP TABLE `Network`;

-- DropTable
DROP TABLE `ScanReport`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `UserDomainRelation`;

-- CreateTable
CREATE TABLE `scan_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(255) NOT NULL,
    `duration` INTEGER NOT NULL,
    `details` JSON NULL,
    `fqdn` VARCHAR(255) NOT NULL,
    `SubResourceIntegrity` BOOLEAN NULL,
    `NoMixedContent` BOOLEAN NULL,
    `ResponsibleDisclosure` BOOLEAN NULL,
    `DNSSec` BOOLEAN NULL,
    `CAA` BOOLEAN NULL,
    `IPv6` BOOLEAN NULL,
    `RPKI` BOOLEAN NULL,
    `HTTP` BOOLEAN NULL,
    `HTTP308` BOOLEAN NULL,
    `HTTPRedirectsToHttps` BOOLEAN NULL,
    `HTTPS` BOOLEAN NULL,
    `HSTS` BOOLEAN NULL,
    `HSTSPreloaded` BOOLEAN NULL,
    `ContentSecurityPolicy` BOOLEAN NULL,
    `XFrameOptions` BOOLEAN NULL,
    `XSSProtection` BOOLEAN NULL,
    `ContentTypeOptions` BOOLEAN NULL,
    `SecureSessionCookies` BOOLEAN NULL,
    `TLSv1_2` BOOLEAN NULL,
    `TLSv1_3` BOOLEAN NULL,
    `TLSv1_1_Deactivated` BOOLEAN NULL,
    `StrongKeyExchange` BOOLEAN NULL,
    `StrongCipherSuites` BOOLEAN NULL,
    `ValidCertificate` BOOLEAN NULL,
    `StrongPrivateKey` BOOLEAN NULL,
    `StrongSignatureAlgorithm` BOOLEAN NULL,
    `MatchesHostname` BOOLEAN NULL,
    `NotRevoked` BOOLEAN NULL,
    `CertificateTransparency` BOOLEAN NULL,
    `ValidCertificateChain` BOOLEAN NULL,

    INDEX `scan_reports_fqdn_idx`(`fqdn`),
    INDEX `scan_reports_SubResourceIntegrity_idx`(`SubResourceIntegrity`),
    INDEX `scan_reports_NoMixedContent_idx`(`NoMixedContent`),
    INDEX `scan_reports_ResponsibleDisclosure_idx`(`ResponsibleDisclosure`),
    INDEX `scan_reports_DNSSec_idx`(`DNSSec`),
    INDEX `scan_reports_CAA_idx`(`CAA`),
    INDEX `scan_reports_IPv6_idx`(`IPv6`),
    INDEX `scan_reports_RPKI_idx`(`RPKI`),
    INDEX `scan_reports_HTTP_idx`(`HTTP`),
    INDEX `scan_reports_HTTP308_idx`(`HTTP308`),
    INDEX `scan_reports_HTTPRedirectsToHttps_idx`(`HTTPRedirectsToHttps`),
    INDEX `scan_reports_HTTPS_idx`(`HTTPS`),
    INDEX `scan_reports_HSTS_idx`(`HSTS`),
    INDEX `scan_reports_HSTSPreloaded_idx`(`HSTSPreloaded`),
    INDEX `scan_reports_ContentSecurityPolicy_idx`(`ContentSecurityPolicy`),
    INDEX `scan_reports_XFrameOptions_idx`(`XFrameOptions`),
    INDEX `scan_reports_XSSProtection_idx`(`XSSProtection`),
    INDEX `scan_reports_ContentTypeOptions_idx`(`ContentTypeOptions`),
    INDEX `scan_reports_SecureSessionCookies_idx`(`SecureSessionCookies`),
    INDEX `scan_reports_TLSv1_2_idx`(`TLSv1_2`),
    INDEX `scan_reports_TLSv1_3_idx`(`TLSv1_3`),
    INDEX `scan_reports_TLSv1_1_Deactivated_idx`(`TLSv1_1_Deactivated`),
    INDEX `scan_reports_StrongKeyExchange_idx`(`StrongKeyExchange`),
    INDEX `scan_reports_StrongCipherSuites_idx`(`StrongCipherSuites`),
    INDEX `scan_reports_ValidCertificate_idx`(`ValidCertificate`),
    INDEX `scan_reports_StrongPrivateKey_idx`(`StrongPrivateKey`),
    INDEX `scan_reports_StrongSignatureAlgorithm_idx`(`StrongSignatureAlgorithm`),
    INDEX `scan_reports_MatchesHostname_idx`(`MatchesHostname`),
    INDEX `scan_reports_NotRevoked_idx`(`NotRevoked`),
    INDEX `scan_reports_CertificateTransparency_idx`(`CertificateTransparency`),
    INDEX `scan_reports_ValidCertificateChain_idx`(`ValidCertificateChain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domains` (
    `fqdn` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastScan` INTEGER NULL,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `queued` BOOLEAN NOT NULL DEFAULT false,
    `group` VARCHAR(255) NOT NULL,

    INDEX `domains_group_idx`(`group`),
    PRIMARY KEY (`fqdn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_domain_relations` (
    `userId` VARCHAR(191) NOT NULL,
    `domainId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `domainId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `networks` (
    `cidr` VARCHAR(191) NOT NULL,
    `prefixLength` INTEGER NOT NULL,
    `networkAddress` VARCHAR(191) NOT NULL,
    `startAddress` VARCHAR(191) NOT NULL,
    `endAddress` VARCHAR(191) NOT NULL,
    `startAddressNumber` INTEGER NOT NULL,
    `endAddressNumber` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,

    PRIMARY KEY (`cidr`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `scan_reports` ADD CONSTRAINT `scan_reports_fqdn_fkey` FOREIGN KEY (`fqdn`) REFERENCES `domains`(`fqdn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_domain_relations` ADD CONSTRAINT `user_domain_relations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_domain_relations` ADD CONSTRAINT `user_domain_relations_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `domains`(`fqdn`) ON DELETE RESTRICT ON UPDATE CASCADE;
