/*
  Warnings:

  - You are about to drop the column `teams_users_status` on the `teams_users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `teams_users` DROP FOREIGN KEY `teams_users_teams_users_status_fkey`;

-- AlterTable
ALTER TABLE `teams_users` DROP COLUMN `teams_users_status`,
    ADD COLUMN `teams_users_status_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_teams_users_status_id_fkey` FOREIGN KEY (`teams_users_status_id`) REFERENCES `teams_users_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
