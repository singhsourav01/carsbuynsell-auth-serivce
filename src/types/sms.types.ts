import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createSmsType = Prisma.Args<
  typeof prisma.sms_otp,
  "create"
>["data"];
export type updateSmsType = Prisma.Args<
  typeof prisma.sms_otp,
  "update"
>["data"];
