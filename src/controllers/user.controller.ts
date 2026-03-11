import { ApprovalStatus } from "@prisma/client";
import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import OtpService from "../services/otp.service";
import UserService from "../services/user.service";
import { hashPassword } from "../utils/helper";
import _ from "lodash";
import { createUser } from "../api/user.api";
import UserPortfolioService from "../services/userPortfolio.service";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

class UserController {
  userService: UserService;
  userportfolioService: UserPortfolioService;
  otpService: OtpService;

  constructor() {
    this.userService = new UserService();
    this.userportfolioService = new UserPortfolioService();
    this.otpService = new OtpService();
  }

  private sendToUserServiceIfFullyVerified = async (user_id: string) => {
    const user = await this.userService.getById(user_id);
    if (user.user_email_verified && user.user_phone_verified) {
      try {
        await createUser({
          user_id: user.user_id,
          user_full_name: user.user_full_name,
          user_email: user.user_email,
          user_primary_phone: user.user_primary_phone,
          user_primary_country_id: user.user_primary_country_id,
          user_admin_status: ApprovalStatus.APPROVED,
          user_active: true,
          user_phone_verified: true,
          user_email_verified: true,
          user_profile_image_file_id: user.user_profile_image_file_id,
          user_selfie_file_id: user.user_selfie_file_id,
        });
        console.log(`User ${user_id} sent to user-service successfully`);
      } catch (error: any) {
        console.log(`User-service call failed for user ${user_id}:`, error?.response?.data || error.message);
      }
    }
  };

  signup = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body
    const user = await this.userService.signup(
      {
        user_full_name: data.full_name,
        user_email: data.email,
        user_password: await hashPassword(data.password),
        user_primary_country_id: data.country_id,
        user_primary_phone: data.phone,
        user_gender: data.gender || "MALE",
      },
    );
    await this.userportfolioService.createPortfolio(user.user_id, data.portfolio_ids);
    await this.otpService.sendPhoneOtp(
      data.phone,
      data.country_id,
      user.user_id,
      "REGISTER"
    );
    await this.otpService.sendEmailOtp(
      data.email,
      user.user_id,
      user.user_full_name,
      "REGISTER"
    );
    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, user, API_RESPONSES.SIGN_UP));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const data = await this.userService.getById(user_id);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, data, API_RESPONSES.USER_FETCHED));
  });



  changePhone = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // const { user_id } = req.user;
      const { phone, country_id } = req.body;
      const user_id = "3ebdd94c-7509-408d-8ff5-6261c37999a2";
      const user = await this.userService.changePhone(
        user_id,
        country_id,
        phone
      );

      await this.otpService.sendPhoneOtp(
        phone,
        country_id,
        user.user_id,
        "REGISTER"
      );

      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, user, API_RESPONSES.OTP_SEND));
    }
  );

  changeEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user_id = "3ebdd94c-7509-408d-8ff5-6261c37999a2";
      const { email } = req.body;

      const user = await this.userService.changeEmail(user_id, email);

      await this.otpService.sendEmailOtp(
        email,
        user.user_id,
        user.user_full_name || "",
        "REGISTER"
      );

      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, user, API_RESPONSES.OTP_SEND));
    }
  );

  verifyPhone = asyncHandler(async (req: Request, res: Response) => {
    const { otp, phone } = req.body;
    const userExist = await this.userService.checkUserExistWithPhone(phone);
    const phoneOtp = await this.otpService.getPhoneOtp(phone, otp);
    const user = await this.userService.verifyPhone(userExist.user_id);
    await this.otpService.updateSms(phoneOtp.so_id, { so_is_expired: true });

    // Check if both phone and email are verified → send to user-service
    await this.sendToUserServiceIfFullyVerified(userExist.user_id);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.PHONE_VERIFIED)
      );
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { otp, email } = req.body;
    const userExist = await this.userService.checkUserExistWithEmail(email);
    const emailOtp = await this.otpService.getEmailOtp(email, otp);
    const user = await this.userService.verifyEmail(userExist.user_id);
    await this.otpService.updateEmail(emailOtp.eo_id, { eo_is_expired: true });
    if (user.user_admin_status) {
      const token = req.header("authorization");
      const userData = {
        user_id: userExist.user_id,
        user_full_name: userExist.user_full_name,
        user_password: userExist.user_password,
        user_email: userExist.user_email,
        user_gender: userExist.user_gender,
        user_profile_image_file_id: userExist.user_profile_image_file_id,
        user_primary_country_id: userExist.user_primary_country_id,
        user_primary_phone: userExist.user_primary_phone,
        user_selfie_file_id: userExist.user_selfie_file_id,
        user_admin_status: ApprovalStatus.APPROVED,
        user_active: userExist.user_active,
        user_phone_verified: userExist.user_phone_verified,
        user_email_verified: userExist.user_email_verified,
      };
      const users = await createUser(userData, token);
      // Check if both phone and email are verified → send to user-service
      await this.sendToUserServiceIfFullyVerified(userExist.user_id);

      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, users, API_RESPONSES.EMAIL_VERIFIED)
        );
    }
  });

  // Once the user service will be created
  // verifyUser = asyncHandler(
  //   async (req: AuthenticatedRequest, res: Response) => {
  //     const profile = req.body;
  //     const { user_id } = req.user;
  //     console.log(profile, "here is body");

  //     // const userService = await verifyUser(user_id, req.body);
  //     if (userService)
  //       return res
  //         .status(StatusCodes.OK)
  //         .json(
  //           new ApiResponse(
  //             StatusCodes.OK,
  //             userService,
  //             API_RESPONSES.USER_VERIFICATION_REQUESTED
  //           )
  //         );

  //     const userData = {
  //       user_selfie_file_id: profile.selfie_id,
  //       agency_name: profile.agency_name,
  //       user_profile_image_file_id: profile.profile_image_id,
  //       user_bio: profile.bio,
  //       user_admin_status: ApprovalStatus.PENDING,
  //       user_dob: profile.dob,
  //       user_gender: profile.gender,
  //       user_height: profile.height,
  //       user_created_by_admin: false,
  //       user_female_garments: profile.female_garments,
  //       user_male_garments: profile.male_garments,
  //       has_store: profile.has_store,
  //       has_studio: profile.has_studio,
  //       has_studio1: profile.has_studio1,
  //       has_agency: profile.has_agency,
  //       is_private_user: profile.is_private_user,
  //       user_managed_by: profile.user_managed_by,
  //     };

  //     const locationData = profile.address?.map((address: any) => ({
  //       ul_user_id: user_id,
  //       ul_country_id: address.country_id,
  //       ul_state_id: address.state_id,
  //       ul_city_id: address.city_id,
  //       ul_lat: address.lat,
  //       ul_long: address.long,
  //       ul_address: address.address,
  //       ul_location_type: address.type,
  //     }));
  //     console.log(locationData, " here is location data");
  //     const user = await this.userService.verifyUser(
  //       user_id,
  //       userData,
  //       profile.portfolio_ids,
  //       profile.social_links,
  //       profile.video_links,
  //       locationData,
  //       profile?.designer_talents,
  //       profile?.photographer_talents,
  //       profile?.store_address,
  //       profile?.studio_address,
  //       profile?.studio_address1,
  //       profile?.user_calender,
  //       profile?.user_model_attribute,
  //       profile?.agency_address
  //     );
  //     return res
  //       .status(StatusCodes.OK)
  //       .json(
  //         new ApiResponse(
  //           StatusCodes.OK,
  //           user,
  //           API_RESPONSES.USER_VERIFICATION_REQUESTED
  //         )
  //       );
  //   }
  // );

  // updatePhone = asyncHandler(async (req: Request, res: Response) => {
  //   const { otp, phone } = req.body;

  //   await this.otpService.getPhoneOtp(phone, otp);
  //   await this.userService.updatePhone({ user_primary_phone: phone }, req);
  //   return res
  //     .status(StatusCodes.OK)
  //     .json(new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.PHONE_VERIFIED));
  // });

  // getVerifyUser = asyncHandler(
  //   async (req: AuthenticatedRequest, res: Response) => {
  //     const user = await this.userService.getVerifyUser(req);
  //     return res
  //       .status(StatusCodes.OK)
  //       .json(
  //         new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_FETCHED)
  //       );
  //   }
  // );

  // getUserByPhone = asyncHandler(async (req: Request, res: Response) => {
  //   const { phone } = req.query;
  //   const user = await this.userService.getUserPhone(String(phone));
  //   return res
  //     .status(StatusCodes.OK)
  //     .json(new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_FETCHED));
  // });

  //   createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  //   const data = req.body;
  //   const user = await this.userService.createUserByAdmin(
  //     {
  //       user_full_name: data.full_name,
  //       user_email: data.email,
  //       user_primary_country_id: data.country_id,
  //       user_primary_phone: data.phone,
  //       user_referred_by: data.referred_by,
  //       user_gender: data.gender,
  //       user_bio: data.bio,
  //       user_dob: data.dob,
  //       user_created_by_admin: true,
  //     },

  //   );

  //   return res
  //     .status(StatusCodes.CREATED)
  //     .json(
  //       new ApiResponse(StatusCodes.CREATED, { ...user }, API_RESPONSES.SIGN_UP)
  //     );
  // });
}

export default UserController;


