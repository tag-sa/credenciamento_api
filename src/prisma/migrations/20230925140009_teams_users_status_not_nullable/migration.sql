/*
  Warnings:

  - Made the column `teams_users_status` on table `teams_users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `teams_users` DROP FOREIGN KEY `teams_users_teams_users_status_fkey`;

-- AlterTable
ALTER TABLE `teams_users` MODIFY `teams_users_status` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_teams_users_status_fkey` FOREIGN KEY (`teams_users_status`) REFERENCES `teams_users_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
