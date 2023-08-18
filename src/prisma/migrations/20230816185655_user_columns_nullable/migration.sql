/*
  Warnings:

  - Made the column `nickname` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `nickname` VARCHAR(191) NOT NULL,
    MODIFY `rg` VARCHAR(9) NULL,
    MODIFY `root` BOOLEAN NULL DEFAULT false,
    MODIFY `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `change_password` BOOLEAN NULL DEFAULT false;
