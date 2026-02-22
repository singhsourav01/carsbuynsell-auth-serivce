import { ApprovalStatus, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserRequest = {
  full_name: string;
  email: string;
  password: string;
  country_id: string;
  phone: string;
  talent_ids: string[];
  referred_by?: string;
};

export type createUserType = Prisma.Args<typeof prisma.users, "create">["data"];

export type updateUserType = Prisma.Args<typeof prisma.users, "update">["data"];

export type userResponseType = {
  user_id: string;
  user_full_name: string;
  user_email: string;
  user_role: string;
  user_primary_country_id: string;
  user_primary_phone: string;
};

export type getAllUserQueryType = {
  status?: ApprovalStatus;
  search?: string;
  page?: string;
  page_size?: string;
};
