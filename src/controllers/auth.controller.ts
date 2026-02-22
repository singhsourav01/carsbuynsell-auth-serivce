import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
// import { deleteUserLoginDevice } from "../api/user.api";
import { API_RESPONSES, SIGN_IN_RESPONSE } from "../constants/app.constant";
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



  // refreshToken = asyncHandler(async (req: Request, res: Response) => {
  //   const { refresh_token, uld_id } = req.body;
  //   const data = await this.authService.refreshToken(refresh_token, uld_id);
  //   return res
  //     .status(StatusCodes.OK)
  //     .json(
  //       new ApiResponse(
  //         StatusCodes.OK,
  //         data,
  //         API_RESPONSES.TOKEN_UPDATED_SUCCESSFULLY
  //       )
  //     );
  // });

  // Implemented after user-service 
  // logout = asyncHandler(async (req: Request, res: Response) => {
  //   const { uld_id } = req.params;
  //   await deleteUserLoginDevice(uld_id);
  //   return res
  //     .status(StatusCodes.OK)
  //     .json(
  //       new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.LOG_OUT_SUCCESSFULLY)
  //     );
  // });
}

export default AuthController;
