/*
  Warnings:

  - You are about to drop the column `city` on the `advertisers` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `advertisers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `advertisers` DROP COLUMN `city`,
    DROP COLUMN `state`;
