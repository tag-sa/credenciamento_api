-- AlterTable
ALTER TABLE `teams_users` ADD COLUMN `tax` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `tax_type` ENUM('period', 'hour') NOT NULL DEFAULT 'period';
