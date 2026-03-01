import { body } from "express-validator";

export const loginValidations = [
  body("user_details").notEmpty().withMessage("user_details is required field"),
  body("password").notEmpty().withMessage("password is required field"),
  // body("device_name").notEmpty().withMessage("device_name is required field"),
  // body("device_type").notEmpty().withMessage("device_type is required field"),
  // body("fcm_token").notEmpty().withMessage("fcm_token is required field"),
];

export const loginWithOTPValidation = [
  body("user_details").notEmpty().withMessage("user_details is required field"),
  body("otp").notEmpty().withMessage("otp is required field"),
  body("device_name").notEmpty().withMessage("device_name is required field"),
  body("device_type").notEmpty().withMessage("device_type is required field"),
  body("fcm_token").notEmpty().withMessage("fcm_token is required field"),
];

export const forgetPasswordValidation = [
  body("user_details").notEmpty().withMessage("user_details is required field"),
];

export const resetPasswordValidation = [
  body("user_details").notEmpty().withMessage("user_details is required field"),
  body("password").notEmpty().withMessage("password is required field"),
  body("otp").notEmpty().withMessage("otp is required field"),
];

export const refreshTokenValidations = [
  body("refresh_token")
    .notEmpty()
    .withMessage("refresh_token is required field"),
];

export const logoutValidations = [
  body("refresh_token")
    .notEmpty()
    .withMessage("refresh_token is required field"),
];
