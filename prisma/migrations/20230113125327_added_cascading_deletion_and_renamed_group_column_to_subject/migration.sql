/*
  Warnings:

  - The primary key for the `stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `group` on the `stats` table. All the data in the column will be lost.
  - Added the required column `subject` to the `stats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `dashboards` DROP FOREIGN KEY `dashboards_userId_fkey`;

-- DropForeignKey
ALTER TABLE `scan_reports` DROP FOREIGN KEY `scan_reports_fqdn_fkey`;

-- DropForeignKey
ALTER TABLE `user_domain_relations` DROP FOREIGN KEY `user_domain_relations_fqdn_fkey`;

-- DropForeignKey
ALTER TABLE `user_domain_relations` DROP FOREIGN KEY `user_domain_relations_userId_fkey`;

-- AlterTable
ALTER TABLE `stats` DROP PRIMARY KEY,
    DROP COLUMN `group`,
    ADD COLUMN `subject` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`subject`, `time`);

-- AddForeignKey
ALTER TABLE `scan_reports` ADD CONSTRAINT `scan_reports_fqdn_fkey` FOREIGN KEY (`fqdn`) REFERENCES `domains`(`fqdn`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_domain_relations` ADD CONSTRAINT `user_domain_relations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_domain_relations` ADD CONSTRAINT `user_domain_relations_fqdn_fkey` FOREIGN KEY (`fqdn`) REFERENCES `domains`(`fqdn`) ON DELETE CASCADE ON UPDATE CASCADE;
