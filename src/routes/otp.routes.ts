import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import OtpController from "../controllers/otp.controller";

const OtpRoutes = express.Router();
const otpController = new OtpController();

OtpRoutes.route(API_ENDPOINTS.SEND_PHONE_OTP).post(otpController.sendPhoneOtp);
OtpRoutes.route(API_ENDPOINTS.SEND_EMAIL_OTP).post(otpController.sendEmailOtp);
OtpRoutes.route(API_ENDPOINTS.SEND_PHONE_EMAIL_OTP).post(
  otpController.sendPhoneEmailOtp
);

export default OtpRoutes;
