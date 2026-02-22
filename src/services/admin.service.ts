import { ApprovalStatus } from "@prisma/client";
import { ApiError } from "common-microservices-utils";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS, API_ERRORS, INTEGERS } from "../constants/app.constant";
import UserRepository from "../repositories/user.repository";
import {
  getEmailBodyForChangingUserStatus,
  getLinkData,
} from "../utils/helper";

class AdminService {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getAllUsers = async (
    page?: string,
    page_size?: string,
    status?: ApprovalStatus,
    search?: string
  ) => {
    const pageNumber = Number(page || "1");
    const take = Number(page_size || "10");
    const skip = (pageNumber - INTEGERS.ONE) * take;

    const userData = await this.userRepository.getAllUsers(
      take,
      skip,
      status,
      search
    );

    const promises = userData.map(async (item: any) => {
      const { user_profile_image_file_id, user_selfie_file_id, ...userData } =
        item;
      return {
        ...userData
      };
    });

    const users = await Promise.all(promises);
    const count = await this.userRepository.countUser(status, search);
    const link = getLinkData(pageNumber, take, count, API_ENDPOINTS.USERS);

    return { users, count, link };
  };

  getUserById = async (user_id: string) => {
    const user = await this.userRepository.getById(user_id);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_DOES_NOT_EXIST);

    const { user_profile_image_file_id, user_selfie_file_id, ...userData } =
      user;
    const {  ...rest } = userData;

    return {
      ...rest,
      user_profile_image:
        user_profile_image_file_id ,
        // (await getFileById(user_profile_image_file_id))?.file_url,
      user_selfie_image:user_selfie_file_id
        // (await getFileById(user_selfie_file_id))?.file_url,
    };
  };

  changeUserStatus = async (
    user_id: string,
    status: ApprovalStatus,
    reason: string,
    req: Request
  ) => {
    let user;
    console.log(user_id, status, reason , " check all")
    const userExist = await this.userRepository.getAllDetailsById(user_id);
    if (!userExist)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_DOES_NOT_EXIST
      );

    if (status === ApprovalStatus.APPROVED) {
      // user = await createUser({ ...userExist, locations }, req);
      if (!user) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          API_ERRORS.ERROR_CHANGING_STATUS
        );
      }
      await this.userRepository.delete(user_id);
    } else {
      if (status === ApprovalStatus.REJECTED) {
        const country = "91";
        console.log({
          mobile_number: userExist.user_primary_phone,
          country_code: "91",
          text: `Dear user your account is rejected by the admin.\nDue to "${reason}"\n Please log in with your credentials, make the necessary changes, and resend the account for approval.`,
        })
        // await sendSms({
        //   mobile_number: userExist.user_primary_phone,
        //   country_code: country?.country_phone_code,
        //   text: `Dear user your account is rejected by the admin.\nDue to "${reason}"\n Please log in with your credentials, make the necessary changes, and resend the account for approval.`,
        // });
      }
      user = await this.userRepository.update(user_id, {
        user_admin_status: status,
      });
    }
    console.log({
      subject: "Profile verification status",
      email: userExist.user_email || "",
      body: getEmailBodyForChangingUserStatus(reason)[status],
      type: "general",
    })
    // await sendMail({
    //   subject: "Profile verification status",
    //   email: userExist.user_email || "",
    //   body: getEmailBodyForChangingUserStatus(reason)[status],
    //   type: "general",
    // });
    return user;
  };

  getPendingUserCount = async () => {
    return await this.userRepository.getAdminPendingUserCount();
  };

  deleteById = async (user_id: string) => {
    const user = await this.userRepository.getById(user_id);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);
    return await this.userRepository.delete(user_id);
  };
}

export default AdminService;
