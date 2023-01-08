-- CreateTable
CREATE TABLE `ScanReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipV4` VARCHAR(255) NOT NULL,
    `duration` INTEGER NOT NULL,
    `details` JSON NOT NULL,
    `fqdn` VARCHAR(255) NOT NULL,

    INDEX `ScanReport_fqdn_idx`(`fqdn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dashboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Domain` (
    `fqdn` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastScan` DATETIME(3) NOT NULL,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `queued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`fqdn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDomainRelation` (
    `userId` VARCHAR(191) NOT NULL,
    `domainId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `domainId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScanReport` ADD CONSTRAINT `ScanReport_fqdn_fkey` FOREIGN KEY (`fqdn`) REFERENCES `Domain`(`fqdn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDomainRelation` ADD CONSTRAINT `UserDomainRelation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDomainRelation` ADD CONSTRAINT `UserDomainRelation_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`fqdn`) ON DELETE RESTRICT ON UPDATE CASCADE;
