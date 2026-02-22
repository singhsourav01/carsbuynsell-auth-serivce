import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createEmailType = Prisma.Args<
  typeof prisma.email_otp,
  "create"
>["data"];
export type updateEmailType = Prisma.Args<
  typeof prisma.email_otp,
  "update"
>["data"];
