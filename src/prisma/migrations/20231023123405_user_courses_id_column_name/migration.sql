/*
  Warnings:

  - The primary key for the `users_courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `int` on the `users_courses` table. All the data in the column will be lost.
  - Added the required column `id` to the `users_courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users_courses` DROP PRIMARY KEY,
    DROP COLUMN `int`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
