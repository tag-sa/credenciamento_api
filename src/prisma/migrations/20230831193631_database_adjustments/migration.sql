/*
  Warnings:

  - You are about to drop the column `user_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `advertiser_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `parking_slots` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `supervisor` on the `teams_users` table. All the data in the column will be lost.
  - Added the required column `advertiser_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `teams` DROP FOREIGN KEY `teams_advertiser_id_fkey`;

-- AlterTable
ALTER TABLE `events` DROP COLUMN `user_id`,
    ADD COLUMN `advertiser_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `teams` DROP COLUMN `advertiser_id`,
    DROP COLUMN `parking_slots`;

-- AlterTable
ALTER TABLE `teams_users` DROP COLUMN `supervisor`,
    MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
