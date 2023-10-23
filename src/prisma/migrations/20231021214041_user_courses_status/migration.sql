/*
  Warnings:

  - Added the required column `user_course_status_id` to the `users_courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users_courses` ADD COLUMN `user_course_status_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `users_courses_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users_courses` ADD CONSTRAINT `users_courses_user_course_status_id_fkey` FOREIGN KEY (`user_course_status_id`) REFERENCES `users_courses_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
