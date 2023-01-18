-- CreateTable
CREATE TABLE `stats` (
    `group` VARCHAR(191) NOT NULL,
    `time` BIGINT NOT NULL,
    `value` JSON NOT NULL,

    PRIMARY KEY (`group`, `time`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
