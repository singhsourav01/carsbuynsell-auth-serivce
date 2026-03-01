-- AlterTable
ALTER TABLE `sms_otp` ADD COLUMN `so_attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `so_expires_at` DATETIME(3) NULL,
    ADD COLUMN `so_is_used` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `rt_id` VARCHAR(191) NOT NULL,
    `rt_user_id` VARCHAR(191) NOT NULL,
    `rt_token` TEXT NOT NULL,
    `rt_is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `rt_expires_at` DATETIME(3) NOT NULL,
    `rt_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rt_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`rt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
