-- AlterTable
ALTER TABLE `domains` ADD COLUMN `monitor` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `scan_reports` MODIFY `ipAddress` VARCHAR(255) NULL;
