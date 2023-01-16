/*
  Warnings:

  - The `lastScan` column on the `Domain` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ipV4` on the `ScanReport` table. All the data in the column will be lost.
  - Added the required column `ipAddress` to the `ScanReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Domain` DROP COLUMN `lastScan`,
    ADD COLUMN `lastScan` INTEGER NULL;

-- AlterTable
ALTER TABLE `ScanReport` DROP COLUMN `ipV4`,
    ADD COLUMN `ipAddress` VARCHAR(255) NOT NULL;
