/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `cnpj` VARCHAR(14) NULL,
    ADD COLUMN `type` VARCHAR(2) NULL,
    MODIFY `cpf` VARCHAR(11) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_cnpj_key` ON `users`(`cnpj`);
