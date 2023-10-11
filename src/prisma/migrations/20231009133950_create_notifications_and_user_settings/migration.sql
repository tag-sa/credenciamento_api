-- CreateTable
CREATE TABLE `users_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `enable_convocation` BOOLEAN NOT NULL DEFAULT true,
    `jobs_notifications` BOOLEAN NOT NULL DEFAULT true,
    `jobs_types` ENUM('general', 'by_function') NOT NULL DEFAULT 'general',
    `distance` INTEGER NOT NULL DEFAULT 10,
    `show_score` BOOLEAN NOT NULL DEFAULT true,
    `show_jobs_worked` BOOLEAN NOT NULL DEFAULT true,
    `convocations_needs_approval` BOOLEAN NOT NULL DEFAULT true,
    `disabled_notifications` BOOLEAN NOT NULL DEFAULT false,
    `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NOT NULL,
    `reference_id` INTEGER NOT NULL,
    `notifications_types_id` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `users_id` INTEGER NOT NULL,
    `notifications_id` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notifications_types_users_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications_types_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notifications_types_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('all', 'system', 'email', 'push', 'sms', 'whatsapp') NOT NULL DEFAULT 'email',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users_settings` ADD CONSTRAINT `users_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_notifications_types_id_fkey` FOREIGN KEY (`notifications_types_id`) REFERENCES `notifications_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications_status` ADD CONSTRAINT `notifications_status_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications_status` ADD CONSTRAINT `notifications_status_notifications_id_fkey` FOREIGN KEY (`notifications_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications_status` ADD CONSTRAINT `notifications_status_notifications_types_users_id_fkey` FOREIGN KEY (`notifications_types_users_id`) REFERENCES `notifications_types_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications_types_users` ADD CONSTRAINT `notifications_types_users_notifications_types_id_fkey` FOREIGN KEY (`notifications_types_id`) REFERENCES `notifications_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications_types_users` ADD CONSTRAINT `notifications_types_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
