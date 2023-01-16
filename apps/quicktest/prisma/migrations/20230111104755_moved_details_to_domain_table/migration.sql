/*
  Warnings:

  - You are about to drop the column `details` on the `scan_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `domains` ADD COLUMN `details` JSON NULL;

-- AlterTable
ALTER TABLE `scan_reports` DROP COLUMN `details`;
