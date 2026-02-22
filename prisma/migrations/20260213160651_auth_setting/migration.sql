-- CreateTable
CREATE TABLE `users` (
    `_id` VARCHAR(191) NOT NULL,
    `user_full_name` VARCHAR(191) NULL,
    `user_email` VARCHAR(191) NULL,
    `user_primary_country_id` VARCHAR(191) NULL,
    `user_primary_phone` VARCHAR(191) NOT NULL,
    `user_gender` ENUM('MALE', 'FEMALE', 'OTHER', 'BOTH') NULL,
    `user_password` VARCHAR(191) NULL,
    `user_role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `user_admin_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `user_email_verified` BOOLEAN NOT NULL DEFAULT false,
    `user_phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `user_bio` LONGTEXT NULL,
    `user_dob` DATETIME(3) NULL,
    `user_active` BOOLEAN NULL DEFAULT true,
    `user_profile_image_file_id` VARCHAR(191) NULL,
    `user_selfie_file_id` VARCHAR(191) NULL,
    `user_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_updated_at` DATETIME(3) NOT NULL,
    `is_private_user` BOOLEAN NULL DEFAULT false,

    FULLTEXT INDEX `users_user_full_name_user_email_idx`(`user_full_name`, `user_email`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_otp` (
    `so_id` VARCHAR(191) NOT NULL,
    `so_user_id` VARCHAR(191) NULL,
    `so_country_code` VARCHAR(191) NOT NULL,
    `so_receiver` VARCHAR(191) NOT NULL,
    `so_token` VARCHAR(191) NOT NULL,
    `so_is_expired` BOOLEAN NOT NULL DEFAULT false,
    `so_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `so_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`so_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_otp` (
    `eo_id` VARCHAR(191) NOT NULL,
    `eo_user_id` VARCHAR(191) NULL,
    `eo_sender` VARCHAR(191) NOT NULL,
    `eo_receiver` VARCHAR(191) NOT NULL,
    `eo_token` VARCHAR(191) NOT NULL,
    `eo_is_expired` BOOLEAN NOT NULL DEFAULT false,
    `eo_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eo_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`eo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
