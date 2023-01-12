-- CreateTable
CREATE TABLE `Network` (
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
