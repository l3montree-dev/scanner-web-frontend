/*
  Warnings:

  - Added the required column `group` to the `Domain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Domain` ADD COLUMN `group` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `Domain_group_idx` ON `Domain`(`group`);
