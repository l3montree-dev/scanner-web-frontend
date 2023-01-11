/*
  Warnings:

  - The primary key for the `user_domain_relations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `domainId` on the `user_domain_relations` table. All the data in the column will be lost.
  - Added the required column `fqdn` to the `user_domain_relations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user_domain_relations` DROP FOREIGN KEY `user_domain_relations_domainId_fkey`;

-- AlterTable
ALTER TABLE `user_domain_relations` DROP PRIMARY KEY,
    DROP COLUMN `domainId`,
    ADD COLUMN `fqdn` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `fqdn`);

-- AddForeignKey
ALTER TABLE `user_domain_relations` ADD CONSTRAINT `user_domain_relations_fqdn_fkey` FOREIGN KEY (`fqdn`) REFERENCES `domains`(`fqdn`) ON DELETE RESTRICT ON UPDATE CASCADE;
