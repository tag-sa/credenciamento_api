/*
  Warnings:

  - Added the required column `conclusion_date` to the `users_courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_type` to the `users_courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users_courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users_courses` ADD COLUMN `certified_url` VARCHAR(191) NULL,
    ADD COLUMN `conclusion_date` DATE NOT NULL,
    ADD COLUMN `course_type` INTEGER NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `place` VARCHAR(191) NULL,
    MODIFY `course_id` INTEGER NULL,
    MODIFY `valid_until` DATE NOT NULL;
