-- CreateTable
CREATE TABLE `user_portfolio` (
    `_id` VARCHAR(191) NOT NULL,
    `up_user_id` VARCHAR(191) NOT NULL,
    `up_file_id` VARCHAR(191) NOT NULL,
    `up_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `up_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_portfolio` ADD CONSTRAINT `user_portfolio_up_user_id_fkey` FOREIGN KEY (`up_user_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;
