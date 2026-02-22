export const signupBodyPick = [
  "full_name",
  "email",
  "password",
  "country_id",
  "phone",
];

export const signupUserPick = [
  "user_id",
  "user_full_name",
  "user_email",
  "user_role",
  "user_primary_phone",
  "user_phone_verified",
  "user_email_verified",
];

export const changePhonePick = [
  "user_id",
  "user_full_name",
  "user_primary_phone",
  "user_primary_country_id",
];

export const changeEmailPick = [
  "user_id",
  "user_full_name",
  "email",
];

export const nonApprovedUserPick = [
  "user_id",
  "user_email",
  "user_primary_phone",
  "user_email_verified",
  "user_phone_verified",
  "user_admin_status",
  "user_role",
  "access_token",
];

export const getUserByPhonePick = ["user_id", "user_full_name"];
