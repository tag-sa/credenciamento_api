-- DropForeignKey
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_entity_id_fkey`;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
