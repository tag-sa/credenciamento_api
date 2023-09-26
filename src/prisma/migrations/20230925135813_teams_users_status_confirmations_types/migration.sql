/*
  Warnings:

  - You are about to drop the column `teamsUsersStatusId` on the `teams_users` table. All the data in the column will be lost.
  - You are about to alter the column `confirmed` on the `teams_users` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(7))`.

*/
-- DropForeignKey
ALTER TABLE `teams_users` DROP FOREIGN KEY `teams_users_teamsUsersStatusId_fkey`;

-- AlterTable
ALTER TABLE `teams_users` DROP COLUMN `teamsUsersStatusId`,
    ADD COLUMN `teams_users_status` INTEGER NULL,
    MODIFY `confirmed` ENUM('a', 'c', 'd') NOT NULL DEFAULT 'a';

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_teams_users_status_fkey` FOREIGN KEY (`teams_users_status`) REFERENCES `teams_users_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
