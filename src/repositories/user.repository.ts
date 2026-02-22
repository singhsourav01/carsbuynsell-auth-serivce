import { createUserType } from "./../types/onboarding.types";
import { ApprovalStatus, Role } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { updateUserType } from "../types/onboarding.types";
import { queryHandler } from "../utils/helper";
import { userSelect } from "../constants/prisma.constant";

class UserRepository {
  checkUserExistWithEmail = async (user_email: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: { user_email },
        })
    );
  };

  checkUserExistWithPhone = async (user_primary_phone: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_primary_phone,
          },
        })
    );
  };
  getUserByPhoneToGetUserId = async (user_primary_phone: string) => {
    return queryHandler(async () => {
      return await prisma.users.findFirst({
        where: {
          user_primary_phone,
        },
        select: {
          user_id: true,
          user_primary_phone: true,
          user_email: true,
          user_phone_verified: true,
          user_email_verified: true,
          user_password: true,
          user_selfie_file_id: true,
        },
      });
    });
  };

  checkPhoneIsAlreadyExist = async (user_primary_phone: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_primary_phone,
          },
          select: {
            user_phone_verified: true,
            user_id: true,
          },
        })
    );
  };

  getByPhone = async (user_primary_phone: string) => {
    const result = await queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_primary_phone,
          },
          select: {
            user_primary_phone: true,
          },
        })
    );
    return result ? result.user_primary_phone : false;
  };
  getByEmail = async (user_email: string) => {
    const result = await queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_email,
          },
          select: {
            user_email: true,
          },
        })
    );
    return result ? result.user_email : false;
  };

  checkEmailIsAlreadyExist = async (user_email: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_email,
          },
          select: {
            user_email_verified: true,
          },
        })
    );
  };

  checkEmailIsAlreadyExistAndAdmin = async (user_email: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            user_email,
          },
          select: {
            user_email_verified: true,
          },
        })
    );
  };

  checkUserExistWithEmailOrPhone = async (
    user_email: string,
    user_primary_phone: string
  ) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            OR: [{ user_primary_phone }, { user_email }],
          },
          select: {
            user_id: true,
            user_primary_phone: true,
            user_email: true,
            user_phone_verified: true,
            user_email_verified: true,
            user_password: true,
            user_selfie_file_id: true,
          },
        })
    );
  };

  signup = async (data: createUserType) => {
    return queryHandler(
      async () =>
        await prisma.users.create({
          data,
        })
    );
  };

  verifyEmail = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data: { user_email_verified: true },
          select: userSelect,
        })
    );
  };

  verifyPhone = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data: { user_phone_verified: true },
          select: userSelect,
        })
    );
  };

  delete = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.delete({
          where: { user_id },
        })
    );
  };

  update = async (user_id: string, data: updateUserType) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data,
          select: userSelect,
        })
    );
  };

  getById = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findUnique({
          where: { user_id },
          select: userSelect,
        })
    );
  };

  getAllDetailsById = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findUnique({
          where: { user_id },
        })
    );
  };

  getAll = async (
    take: number,
    skip: number,
    status?: ApprovalStatus,
    search?: string
  ) => {
    const where: any = {
      NOT: [
        {
          user_admin_status: ApprovalStatus.PENDING,
        },
        {
          user_role: Role.ADMIN,
        },
      ],
    };
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }
    if (status) where.user_admin_status = status;

    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where,
          select: userSelect,
          take,
          skip,
        })
    );
  };

  getAllUsers = async (
    take: number,
    skip: number,
    status?: ApprovalStatus,
    search?: string
  ) => {
    const where: any = {
      user_email_verified: true,
      user_phone_verified: true,
      NOT: [
        {
          user_admin_status: ApprovalStatus.APPROVED
        },
        {
          user_role: Role.ADMIN,
        },
      ],
    };
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }
    if (status) where.user_admin_status = status;

    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where,
          select: userSelect,
          take,
          skip,
        })
    );
  };

  count = async (status?: ApprovalStatus, search?: string) => {
    const where: any = {
      NOT: [
        {
          user_admin_status: ApprovalStatus.APPROVED,
        },
        {
          user_role: Role.ADMIN,
        },
      ],
    };
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }

    if (status) where.user_admin_status = status;
    return queryHandler(
      async () =>
        await prisma.users.count({
          where,
        })
    );
  };

  countUser = async (status?: ApprovalStatus, search?: string) => {
    const where: any = {
      user_email_verified: true,
      user_phone_verified: true,
      NOT: [
        {
          user_admin_status: ApprovalStatus.APPROVED,
        },
        {
          user_role: Role.ADMIN,
        },
      ],
    };
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }

    if (status) where.user_admin_status = status;
    return queryHandler(
      async () =>
        await prisma.users.count({
          where,
        })
    );
  };

  getPendingUserCount = async () => {
    return queryHandler(
      async () =>
        await prisma.users.count({
          where: { user_admin_status: ApprovalStatus.PENDING },
        })
    );
  };

  getAdminPendingUserCount = async () => {
    return queryHandler(
      async () =>
        await prisma.users.count({
          where: {
            user_admin_status: ApprovalStatus.PENDING,
            user_phone_verified: true,
            user_email_verified: true,
          },
        })
    );
  };

  getUserByPhone = async (phone: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            OR: [
              { user_primary_phone: phone },
            ],
          },
        })
    );
  };
}

export default UserRepository;
