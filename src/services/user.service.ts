import { ApiError } from "common-microservices-utils";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
// import {
//   getByEmail,
//   getByPhone,
//   getUserByEmailOrPhone,
//   getUserByPhone,
//   getVerifyUser,
//   updateUser,
// } from "../api/user.api";
// import { getFileById } from "../api/file.api";
import { API_ERRORS } from "../constants/app.constant";
import {
  changeEmailPick,
  changePhonePick,
  getUserByPhonePick,
} from "../constants/user.contant";
import UserRepository from "../repositories/user.repository";
import { createUserType, updateUserType } from "../types/onboarding.types";
import { generateAccessToken } from "../utils/helper";
import { AuthenticatedRequest } from "../controllers/user.controller";
import { getByEmail, getByPhone, getUserDetailsByEmailOrPhone } from "../api/user.api";

class UserService {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  checkUserExistWithEmail = async (user_email: string) => {
    const user = await this.userRepository.checkUserExistWithEmail(user_email);
    if (!user)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_DOES_NOT_EXIST
      );
    return user;
  };

  checkUserExistWithPhone = async (phone: string) => {
    const user = await this.userRepository.checkUserExistWithPhone(phone);
    if (!user)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_DOES_NOT_EXIST
      );
    return user;
  };

  checkUserExistWithEmailOrPhone = async (email: string, phone: string) => {
    let user;
    const userExistInUserService = await getUserDetailsByEmailOrPhone(email || phone);
    if (userExistInUserService) {
      return userExistInUserService;
    } else {
      user = await this.userRepository.checkUserExistWithEmailOrPhone(
        email,
        phone
      );
    }
    if (!user)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_DOES_NOT_EXIST
      );
    return user;
  };


  signup = async (data: createUserType) => {
    let user: any;

    const checkUserExists = await this.userRepository.getUserByPhoneToGetUserId(
      data.user_primary_phone
    );
    // If user already exits in user-service throw error
    const checkPhoneExists = await getByPhone(data.user_primary_phone);
    const checkEmailExists = await getByEmail(data?.user_email || "");

    if (checkEmailExists && checkPhoneExists)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_ALREADY_EXIST
      );
    if (checkPhoneExists)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE);

    if (checkEmailExists)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_EMAIL);

    if (!checkUserExists) {
      user = await this.userRepository.signup(data);

    } else if (
      (checkUserExists?.user_email_verified || checkUserExists?.user_phone_verified)
    ) {
      if (
        checkUserExists?.user_email_verified && checkUserExists?.user_phone_verified
      )
        throw new ApiError(
          StatusCodes.OK,
          API_ERRORS.PHONE_EMAIL_VERIFIED
        );
      if (
        checkUserExists?.user_email_verified &&
        data?.user_primary_phone !== checkUserExists?.user_primary_phone
      )
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_ALREADY_EXIST_SAME_EMAIL
        );
      if (
        checkUserExists?.user_phone_verified &&
        data?.user_email !== checkUserExists?.user_email
      )
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE
        );
      const userExist =
        await this.userRepository.checkUserExistWithEmailOrPhone(
          data.user_email || "",
          data.user_primary_phone
        );

      user = await this.userRepository.update(userExist?.user_id || "", data);
    } else if (true) {
      // await this.userRepository.delete(checkUserExists.user_id);

      const phoneExist = await this.userRepository.checkPhoneIsAlreadyExist(
        data.user_primary_phone
      );
      const emailExist = await this.userRepository.checkEmailIsAlreadyExist(
        data.user_email || ""
      );
      if (phoneExist && emailExist)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_ALREADY_EXIST
        );
      if (phoneExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE);
      }

      if (emailExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_EMAIL);
      }
      user = await this.userRepository.signup(data);
    }
    const access_token = generateAccessToken(user);
    return { ...user, access_token };
  };

  // createUserByAdmin = async (
  //   data: createUserType,
  // ) => {
  //   const checkPhoneExists = await getByPhone(data.user_primary_phone);
  //   const checkEmailExists = await getByEmail(data.user_email);
  //   const phoneExist = await this.userRepository.getByPhone(
  //     data.user_primary_phone
  //   );
  //   const emailExist = await this.userRepository.getByPhone(
  //     data.user_email || ""
  //   );

  //   if (checkEmailExists && checkPhoneExists)
  //     throw new ApiError(
  //       StatusCodes.BAD_REQUEST,
  //       API_ERRORS.USER_ALREADY_EXIST
  //     );

  //   if (phoneExist && emailExist)
  //     throw new ApiError(
  //       StatusCodes.BAD_REQUEST,
  //       API_ERRORS.USER_ALREADY_EXIST
  //     );

  //   if (checkPhoneExists || phoneExist)
  //     throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE);

  //   if (checkEmailExists || emailExist)
  //     throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_EMAIL);

  //   const user = await this.userRepository.signup(data);

  //   const access_token = generateAccessToken(user);

  //   return { ...user, access_token };
  // };

  changePhone = async (user_id: string, country_id: string, phone: string) => {
    const user = await this.userRepository.getById(user_id);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USERS_NOT_FOUND);

    const phoneExist = await this.userRepository.checkUserExistWithPhone(phone);

    const phoneExistInUserService = false

    if (phoneExist || phoneExistInUserService)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE);

    const updatedUser = await this.userRepository.update(user_id, {
      user_primary_phone: phone,
      user_primary_country_id: country_id,
    });

    const userData = _.pick(updatedUser, changePhonePick);

    return userData;
  };

  changeEmail = async (user_id: string, email: string) => {
    const user = await this.userRepository.getById(user_id);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USERS_NOT_FOUND);

    const emailExist = await this.userRepository.checkUserExistWithEmail(email);
    const emailExistInUserService = false;
    if (emailExist || emailExistInUserService)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_EMAIL);

    const updatedUser = await this.userRepository.update(user_id, {
      user_email: email,
    });
    // console.log(updatedUser, "updated user in change email method");
    console.log(updatedUser, "updated user in change email method");
    return updatedUser;
  };

  verifyEmail = async (user_id: string) => {
    return await this.userRepository.verifyEmail(user_id);
  };

  verifyPhone = async (user_id: string) => {
    return await this.userRepository.verifyPhone(user_id);
  };

  delete = async (user_id: string) => {
    return await this.userRepository.delete(user_id);
  };

  update = async (user_id: string, data: any) => {
    return await this.userRepository.update(user_id, data);
  };

  verifyUser = async (
    user_id: string,
    userData: any,
  ) => {

    return await this.userRepository.update(user_id, userData);
  };

  // updatePhone = async (user_details: updateUserType, req: Request) => {
  //   const existingUser = await getUserByEmailOrPhone(user_details);
  //   if (existingUser) {
  //     throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_ALREADY_EXIST_SAME_PHONE);
  //   }
  //   return await updateUser({ phone: user_details.user_primary_phone }, req);
  // };
  getById = async (uld_id: string) => {
    const user = await this.userRepository.getById(uld_id);
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USERS_NOT_FOUND);
    }

    return user;
  };
  // getVerifyUser = async (req: AuthenticatedRequest) => {
  //   let user;
  //   let userExistInUserService = await getVerifyUser(req);
  //   if (userExistInUserService) {
  //     user = userExistInUserService;
  //   } else {
  //     user = await this.userRepository.getById(req?.user?.user_id);
  //   }
  //   if (!user)
  //     throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USERS_NOT_FOUND);

  //   user.user_profile_image =
  //     user.user_profile_image_file_id &&
  //     (await getFileById(user.user_profile_image_file_id))?.file_url;

  //   user.user_selfie_image =
  //     user.user_selfie_file_id &&
  //     (await getFileById(user.user_selfie_file_id))?.file_url;

  //   return user;
  // };

  // getUserPhone = async (phone: string) => {
  //   let user = await getUserByPhone(phone);

  //   if (!user) {
  //     const userData = await this.userRepository.getUserByPhone(phone);
  //     if (!userData)
  //       throw new ApiError(
  //         StatusCodes.BAD_REQUEST,
  //         API_ERRORS.USER_DOES_NOT_EXIST
  //       );
  //     user = _.pick(userData, getUserByPhonePick);
  //     user.user_profile_image =
  //       userData.user_profile_image_file_id &&
  //       (await getFileById(userData.user_profile_image_file_id))?.file_url;
  //   }
  //   return user;
  // };

}

export default UserService;
