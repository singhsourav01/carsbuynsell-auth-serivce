-- A user can only be PENDING until their email is verified.
-- Heal existing rows that are already verified but still marked PENDING.
UPDATE `users`
SET `user_admin_status` = 'APPROVED'
WHERE `user_email_verified` = true
  AND `user_admin_status` = 'PENDING';
