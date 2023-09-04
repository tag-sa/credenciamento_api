/*
  Warnings:

  - You are about to drop the `Courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Functions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UsersCourses` DROP FOREIGN KEY `UsersCourses_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `UsersCourses` DROP FOREIGN KEY `UsersCourses_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `functions_courses` DROP FOREIGN KEY `functions_courses_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `functions_courses` DROP FOREIGN KEY `functions_courses_function_id_fkey`;

-- DropForeignKey
ALTER TABLE `teams_users` DROP FOREIGN KEY `teams_users_function_id_fkey`;

-- DropTable
DROP TABLE `Courses`;

-- DropTable
DROP TABLE `Functions`;

-- DropTable
DROP TABLE `UsersCourses`;

-- CreateTable
CREATE TABLE `functions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tax` DOUBLE NULL,
    `tax_type` ENUM('period', 'hour') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_courses` (
    `int` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,
    `valid_until` DATETIME(3) NOT NULL,
    `certified` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`int`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `functions_courses` ADD CONSTRAINT `functions_courses_function_id_fkey` FOREIGN KEY (`function_id`) REFERENCES `functions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `functions_courses` ADD CONSTRAINT `functions_courses_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_courses` ADD CONSTRAINT `users_courses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_courses` ADD CONSTRAINT `users_courses_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams_users` ADD CONSTRAINT `teams_users_function_id_fkey` FOREIGN KEY (`function_id`) REFERENCES `functions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
