/*
  Warnings:

  - You are about to drop the column `course_type` on the `users_courses` table. All the data in the column will be lost.
  - Added the required column `course_type_id` to the `users_courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users_courses` DROP COLUMN `course_type`,
    ADD COLUMN `course_type_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `users_courses` ADD CONSTRAINT `users_courses_course_type_id_fkey` FOREIGN KEY (`course_type_id`) REFERENCES `courses_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
