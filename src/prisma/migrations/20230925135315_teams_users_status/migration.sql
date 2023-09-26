-- AlterTable
ALTER TABLE `teams_users` ADD COLUMN `teamsUsersStatusId` INTEGER NULL;

-- CreateTable
CREATE TABLE `teams_users_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_teamsUsersStatusId_fkey` FOREIGN KEY (`teamsUsersStatusId`) REFERENCES `teams_users_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
