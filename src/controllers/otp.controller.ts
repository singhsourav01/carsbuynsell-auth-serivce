import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import OtpService from "../services/otp.service";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import UserService from "../services/user.service";

class OtpController {
  authService: AuthService;
  otpService: OtpService;
  userService: UserService;
  constructor() {
    this.authService = new AuthService();
    this.otpService = new OtpService();
    this.userService = new UserService();
  }

  sendPhoneOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, type } = req.body;
    const user = await this.userService.checkUserExistWithEmailOrPhone(
      phone,
      ""
    );
    const phoneOtp = await this.otpService.sendPhoneOtp(
      phone,
      "91",
      "",
      type
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { phone: phoneOtp.so_receiver },
          API_RESPONSES.OTP_SEND
        )
      );
  });

  sendEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, type } = req.body;
    const user = await this.userService.checkUserExistWithEmailOrPhone(
      email,
      ""
    );
    const emailOtp = await this.otpService.sendEmailOtp(
      email,
      "",
      "",
      type
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { email: emailOtp.eo_receiver },
          API_RESPONSES.OTP_SEND
        )
      );
  });

  sendPhoneEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { user_details, type } = req.body;
    const user = await this.userService.checkUserExistWithEmailOrPhone(
      user_details,
      user_details
    );
    const data = await this.otpService.sendPhoneEmailOtp(user_details);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { email: data?.user_email, phone: "" },
          API_RESPONSES.OTP_SEND
        )
      );
  });
}

export default OtpController;
