import { ApprovalStatus } from "@prisma/client";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
} from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS, API_RESPONSES, INTEGERS } from "../constants/app.constant";
import AdminService from "../services/admin.service";
import { getAllUserQueryType } from "../types/onboarding.types";

class AdminController {
  adminService: AdminService;
  constructor() {
    this.adminService = new AdminService();
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { status, search, page, page_size }: getAllUserQueryType = req.query;
    const { users, count, link } = await this.adminService.getAllUsers(
      page,
      page_size,
      status,
      search
    );

    if (users.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { data: users, link, count },
          API_RESPONSES.USER_FETCHED
        )
      );
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const user = await this.adminService.getUserById(user_id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_FETCHED));
  });

  changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, reason }: { status: ApprovalStatus; reason: string } =
      req.body;
    const { user_id } = req.params;
    console.log(user_id, status, reason , " check all")
    const user = await this.adminService.changeUserStatus(
      user_id,
      status,
      reason,
      req
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_STATUS_UPDATED)
      );
  });

  getPendingUserCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await this.adminService.getPendingUserCount();
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, count, ""));
  });

  deleteById = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    await this.adminService.deleteById(user_id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.USER_DELETED));
  });
}

export default AdminController;
