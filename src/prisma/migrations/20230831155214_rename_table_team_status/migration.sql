/*
  Warnings:

  - You are about to drop the `TeamsStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `teams` DROP FOREIGN KEY `teams_team_status_id_fkey`;

-- DropTable
DROP TABLE `TeamsStatus`;

-- CreateTable
CREATE TABLE `teams_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_team_status_id_fkey` FOREIGN KEY (`team_status_id`) REFERENCES `teams_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
