/*
  Warnings:

  - You are about to drop the column `amount_to_pay` on the `teams_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `teams` ADD COLUMN `extra_amount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `teams_users` DROP COLUMN `amount_to_pay`,
    ADD COLUMN `extra_amount` DOUBLE NULL,
    ADD COLUMN `total_amount` DOUBLE NULL,
    ADD COLUMN `worked_amount` DOUBLE NULL;
