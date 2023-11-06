-- AlterTable
ALTER TABLE `files` MODIFY `original_file_name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `gender` ENUM('m', 'f', 'o', 'n') NULL;
