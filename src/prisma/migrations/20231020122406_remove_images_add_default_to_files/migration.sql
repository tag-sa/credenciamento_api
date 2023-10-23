/*
  Warnings:

  - You are about to drop the column `src` on the `files` table. All the data in the column will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `url` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `images_entity_id_fkey`;

-- AlterTable
ALTER TABLE `files` DROP COLUMN `src`,
    ADD COLUMN `default` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `url` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `images`;
