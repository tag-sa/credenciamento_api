-- DropForeignKey
ALTER TABLE `teams_users` DROP FOREIGN KEY `teams_users_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
