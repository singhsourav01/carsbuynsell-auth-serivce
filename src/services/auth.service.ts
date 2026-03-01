import { ApprovalStatus, users } from "@prisma/client";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { API_ERRORS } from "../constants/app.constant";
import { nonApprovedUserPick } from "../constants/user.contant";
import RefreshTokenRepository from "../repositories/refresh-token.repository";
import UserRepository from "../repositories/user.repository";
import {
  generateAccessToken,
  generateRefreshToken,
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
  refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.otpService = new OtpService();
    this.userService = new UserService();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  generateSignInResponse = async (
    user: any,
    device_name: string,
    device_type: string,
    fcm_token: string
  ) => {
    if (user.user_admin_status === ApprovalStatus.APPROVED) {
      const refreshToken = generateRefreshToken(user);
      user.access_token = generateAccessToken(user);
      user.refresh_token = refreshToken;

      // Store refresh token in DB
      const refreshTokenExpiryDays = parseInt(
        (process.env.REFRESH_TOKEN_EXPIRY || "7d").replace("d", "")
      );
      await this.refreshTokenRepository.create({
        rt_user_id: user.user_id,
        rt_token: refreshToken,
        rt_expires_at: new Date(
          Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000
        ),
      });
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
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_DOES_NOT_EXIST);
    }

    // Check email verification
    if (!user.user_email_verified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.EMAIL_NOT_VERIFIED);
    }

    // Check phone verification
    if (!user.user_phone_verified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.PHONE_NOT_VERIFIED);
    }

    // Check admin approval status
    if (user.user_admin_status !== ApprovalStatus.APPROVED) {
      if (user.user_admin_status === ApprovalStatus.PENDING) {
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.ADMIN_APPROVAL_PENDING);
      }
      if (user.user_admin_status === ApprovalStatus.REJECTED) {
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_REJECTED);
      }
      if (user.user_admin_status === ApprovalStatus.BLOCKED) {
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_BLOCKED);
      }
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_APPROVED);
    }

    // Check if user is active
    if (!user.user_active) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_DEACTIVATED);
    }

    const isPasswordValid = await isPasswordCorrect(
      password,
      user.user_password || ""
    );

    if (!isPasswordValid)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.INVALID_CREDENTIALS
      );

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
      user = await this.userService.checkUserExistWithEmailOrPhone(
        user_details,
        user_details
      );

      const phoneOtp = await this.otpService.getPhoneOtp(
        "9359588022",
        otp
      );
      await this.otpService.updateSms(phoneOtp.so_id, { so_is_expired: true });
    } else if (isValidEmail(user_details)) {
      user = await this.userService.checkUserExistWithEmailOrPhone(
        user_details,
        user_details
      );
      const emailOtp = await this.otpService.getEmailOtp("", otp);
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

    const phoneOtp = await this.otpService.getPhoneOtp("", otp);
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

  refreshToken = async (old_refresh_token: string) => {
    // Decode the token to get user info
    const tokenData: any = jwt.decode(old_refresh_token);
    if (!tokenData || !tokenData.user_id) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.REFRESH_TOKEN_INVALID);
    }

    // Look up the token in DB
    const storedToken = await this.refreshTokenRepository.findByToken(old_refresh_token);
    if (!storedToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.REFRESH_TOKEN_INVALID);
    }

    // Check if revoked
    if (storedToken.rt_is_revoked) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.REFRESH_TOKEN_INVALID);
    }

    // Check if expired
    if (new Date() > storedToken.rt_expires_at) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.REFRESH_TOKEN_EXPIRED);
    }

    // Revoke old token
    await this.refreshTokenRepository.revokeByToken(old_refresh_token);

    // Get full user from DB
    const user = await this.userRepository.getById(tokenData.user_id);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN);
    }

    // Generate new tokens
    const access_token = generateAccessToken(user as any);
    const refresh_token = generateRefreshToken(user as any);

    // Store new refresh token
    const refreshTokenExpiryDays = parseInt(
      (process.env.REFRESH_TOKEN_EXPIRY || "7d").replace("d", "")
    );
    await this.refreshTokenRepository.create({
      rt_user_id: tokenData.user_id,
      rt_token: refresh_token,
      rt_expires_at: new Date(
        Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000
      ),
    });

    return { access_token, refresh_token };
  };

  logout = async (refresh_token: string) => {
    // Revoke the provided refresh token
    const storedToken = await this.refreshTokenRepository.findByToken(refresh_token);
    if (!storedToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.REFRESH_TOKEN_INVALID);
    }
    await this.refreshTokenRepository.revokeByToken(refresh_token);
  };
}

export default AuthService;
