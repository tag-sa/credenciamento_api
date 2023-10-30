-- CreateTable
CREATE TABLE `users_advertises_invites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advertiser_id` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `status` ENUM('a', 'i', 'b') NOT NULL DEFAULT 'a',
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users_advertises_invites` ADD CONSTRAINT `users_advertises_invites_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
