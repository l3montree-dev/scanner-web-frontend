/*
  Warnings:

  - You are about to drop the `_DomainToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_DomainToTag` DROP FOREIGN KEY `_DomainToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DomainToTag` DROP FOREIGN KEY `_DomainToTag_B_fkey`;

-- DropTable
DROP TABLE `_DomainToTag`;

-- CreateTable
CREATE TABLE `_domain_tags` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_domain_tags_AB_unique`(`A`, `B`),
    INDEX `_domain_tags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_domain_tags` ADD CONSTRAINT `_domain_tags_A_fkey` FOREIGN KEY (`A`) REFERENCES `domains`(`fqdn`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_domain_tags` ADD CONSTRAINT `_domain_tags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
