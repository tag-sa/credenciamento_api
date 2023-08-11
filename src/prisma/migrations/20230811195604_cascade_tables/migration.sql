-- DropForeignKey
ALTER TABLE `groups_permissions` DROP FOREIGN KEY `groups_permissions_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `groups_permissions` DROP FOREIGN KEY `groups_permissions_permission_id_fkey`;

-- DropForeignKey
ALTER TABLE `groups_users` DROP FOREIGN KEY `groups_users_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `groups_users` DROP FOREIGN KEY `groups_users_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `permissions` DROP FOREIGN KEY `permissions_module_id_fkey`;

-- AddForeignKey
ALTER TABLE `groups_users` ADD CONSTRAINT `groups_users_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups_users` ADD CONSTRAINT `groups_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups_permissions` ADD CONSTRAINT `groups_permissions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups_permissions` ADD CONSTRAINT `groups_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
