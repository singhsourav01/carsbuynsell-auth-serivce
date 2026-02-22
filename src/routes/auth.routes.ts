import {
  loginWithOTPValidation,
  resetPasswordValidation,
} from "./../validations/auth.validations";
import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import AuthController from "../controllers/auth.controller";
import {
  forgetPasswordValidation,
  loginValidations,
} from "../validations/auth.validations";
import { validate } from "../validations/validate";

const AuthRoutes = express.Router();
const authController = new AuthController();

AuthRoutes.route(API_ENDPOINTS.SIGN_IN).post(
  validate(loginValidations),
  authController.signIn
);
AuthRoutes.route(API_ENDPOINTS.SING_IN_OTP).post(
  validate(loginWithOTPValidation),
  authController.signInWithOtp
);
AuthRoutes.route(API_ENDPOINTS.FORGET_PASSWORD).post(
  validate(forgetPasswordValidation),
  authController.forgetPassword
);
AuthRoutes.route(API_ENDPOINTS.RESET_PASSWORD).put(
  validate(resetPasswordValidation),
  authController.resetPassword
);

// AuthRoutes.route(API_ENDPOINTS.LOGOUT).delete(authController.logout);

// AuthRoutes.route(API_ENDPOINTS.REFRESH_TOKEN).put(authController.refreshToken);

export default AuthRoutes;
