/*
  Warnings:

  - You are about to drop the column `last_access` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_ip` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `last_access`,
    DROP COLUMN `last_ip`,
    DROP COLUMN `last_login`;
