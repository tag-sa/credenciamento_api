-- AlterTable
ALTER TABLE `teams` ADD COLUMN `advertiser_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
