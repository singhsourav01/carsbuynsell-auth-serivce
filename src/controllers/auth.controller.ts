import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import AuthService from "../services/auth.service";
import OtpService from "../services/otp.service";

class AuthController {
  authService: AuthService;
  otpService: OtpService;
  constructor() {
    this.authService = new AuthService();
    this.otpService = new OtpService();
  }

  signIn = asyncHandler(async (req: Request, res: Response) => {
    const { user_details, password, device_name, device_type, fcm_token } =
      req.body;

    const user = await this.authService.signIn(
      user_details,
      password,
      device_name,
      device_type,
      fcm_token
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          user,
        )
      );
  });

  signInWithOtp = asyncHandler(async (req: Request, res: Response) => {
    const { user_details, otp, device_name, device_type, fcm_token } = req.body;

    const user = await this.authService.signInWithOtp(
      user_details,
      otp,
      device_name,
      device_type,
      fcm_token
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          user,
        )
      );
  });

  forgetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { user_details } = req.body;
    const user = await this.authService.forgetPassword(user_details);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, API_RESPONSES.OTP_SEND));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { user_details, password, otp } = req.body;
    await this.authService.resetPassword(user_details, password, otp);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.PASSWORD_UPDATED)
      );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    const data = await this.authService.refreshToken(refresh_token);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          data,
          API_RESPONSES.TOKEN_UPDATED_SUCCESSFULLY
        )
      );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    await this.authService.logout(refresh_token);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.LOG_OUT_SUCCESSFULLY)
      );
  });
}

export default AuthController;
