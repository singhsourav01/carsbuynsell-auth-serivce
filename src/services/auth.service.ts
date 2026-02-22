import { ApprovalStatus, users } from "@prisma/client";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import _ from "lodash";
// import { getFileById } from "../api/file.api";
// import {
//   createUserDevice,
//   getUserByEmailOrPhone,
//   getUserDevice,
//   resetPassword,
//   updateUserDevice,
// } from "../api/user.api";
import { API_ERRORS } from "../constants/app.constant";
import { nonApprovedUserPick } from "../constants/user.contant";
import UserRepository from "../repositories/user.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  // generateAccessToken,
  // generateRefreshToken,
  isPasswordCorrect,
  isValidEmail,
  isValidPhoneNumber,
} from "../utils/helper";
import { hashPassword } from "./../utils/helper";
import OtpService from "./otp.service";
import UserService from "./user.service";

interface SignInType extends users {
  access_token?: string;
  refresh_token?: string;
  user_profile_image?: string;
  uld_id?: string;
}

class AuthService {
  userRepository: UserRepository;
  otpService: OtpService;
  userService: UserService;
  constructor() {
    this.userRepository = new UserRepository();
    this.otpService = new OtpService();
    this.userService = new UserService();
  }

  generateSignInResponse = async (
    user: any,
    device_name: string,
    device_type: string,
    fcm_token: string
  ) => {
    if (user.user_admin_status === ApprovalStatus.APPROVED) {
      user.refresh_token = generateRefreshToken(user);
      user.access_token = generateAccessToken(user);
    }

    if (
      user.user_admin_status === ApprovalStatus.REJECTED ||
      user.user_admin_status === ApprovalStatus.PENDING
    ) {
      user.access_token = generateAccessToken(user);
    }

    if (!user.user_email_verified) {
      this.otpService.sendEmailOtp(
        user.user_email || "",
        user.user_id,
        user.user_full_name || ""
      );
    }

    if (!user.user_phone_verified) {
      this.otpService.sendPhoneOtp(
        user.user_primary_phone,
        user.user_primary_country_id || "",
        user.user_id
      );
    }

    const { user_password, ...userData } = user;
    return user.user_admin_status === ApprovalStatus.APPROVED ? userData : user;
  };

  signIn = async (
    user_details: string,
    password: string,
    device_name: string,
    device_type: string,
    fcm_token: string
  ) => {
    let user = await this.userService.checkUserExistWithEmailOrPhone(
      user_details,
      user_details
    );
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_DELETED);
    }
    if(user?.user_admin_status === ApprovalStatus.PENDING){
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.ADMIN_APPROVAL_PENDING);
    }
    const isPasswordValid = await isPasswordCorrect(
      password,
      user.user_password || ""
    );

    if (!user || !isPasswordValid)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.INVALID_CREDENTIALS
      );
    // return user;
    return this.generateSignInResponse(
      user,
      device_name,
      device_type,
      fcm_token
    );
  };

  signInWithOtp = async (
    user_details: string,
    otp: string,
    device_name: string,
    device_type: string,
    fcm_token: string
  ) => {
    let user;

    // Check if user_details contains an email or phone number
    if (isValidPhoneNumber(user_details)) {
      // If phone number, search by phone
      user = await this.userService.checkUserExistWithEmailOrPhone(
        user_details,
        user_details
      );

      // Proceed with phone OTP
      const phoneOtp = await this.otpService.getPhoneOtp(
        "9359588022",
        otp
      );
      // Update phone OTP status
      await this.otpService.updateSms(phoneOtp.so_id, { so_is_expired: true });
    } else if (isValidEmail(user_details)) {
      // If email, search by email
      user = await this.userService.checkUserExistWithEmailOrPhone(
        user_details,
        user_details
      );
      // Proceed with email OTP
      const emailOtp = await this.otpService.getEmailOtp("", otp);

      // Update email OTP status
      await this.otpService.updateEmail(emailOtp.eo_id, {
        eo_is_expired: true,
      });
    } else {
      throw new Error(
        "Invalid input. Please provide a valid phone number or email."
      );
    }
    const user1 = await this.userService.checkUserExistWithEmailOrPhone(
      user_details,
      user_details
    );

    // return this.generateSignInResponse(
    //   user1,
    //   device_name,
    //   device_type,
    //   fcm_token
    // );
  };

  forgetPassword = async (user_details: string) => {
    const user = await this.userService.checkUserExistWithEmailOrPhone(
      user_details,
      user_details
    );
    // return await this.otpService.sendPhoneEmailOtp(user);
  };

  resetPassword = async (
    user_details: string,
    password: string,
    otp: string
  ) => {
    const user = await this.userService.checkUserExistWithEmailOrPhone(
      user_details,
      user_details
    );

    const phoneOtp = await this.otpService.getPhoneOtp(
      "",
      otp
    );
    const emailOtp = await this.otpService.getEmailOtp("", otp);
    await this.otpService.updateSms(phoneOtp.so_id, { so_is_expired: true });
    await this.otpService.updateEmail(emailOtp.eo_id, { eo_is_expired: true });

    const hashPass = await hashPassword(password);

    const userExist = await this.userRepository.getById("");

    if (userExist) {
      return await this.userRepository.update("", {
        user_password: hashPass,
      });
    } else {
      // return await resetPassword(user.user_id, { password: hashPass });
    }
  };

  // refreshToken = async (old_refresh_token: string, uld_id: string) => {
  //   const tokenData: any = jwt.decode(old_refresh_token);
  //   const user =
  //     tokenData?.email && (await getUserByEmailOrPhone(tokenData?.email));

  //   if (!user) {
  //     throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN);
  //   }

  //   const userDevice = await getUserDevice(uld_id, user.user_id);

  //   if (!userDevice) {
  //     throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_ULD_ID);
  //   }

  //   if (userDevice.uld_refresh_token !== old_refresh_token) {
  //     throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN);
  //   }

  //   const access_token = generateAccessToken(user);
  //   const refresh_token = generateRefreshToken(user);

  //   await updateUserDevice(uld_id, user.user_id, {
  //     access_token,
  //     refresh_token,
  //   });

  //   const { user_password, ...userData } = user;

  //   return { ...userData, access_token, refresh_token, uld_id };
  // };
}

export default AuthService;
