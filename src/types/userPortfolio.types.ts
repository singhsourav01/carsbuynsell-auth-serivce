import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyPortfolio = Prisma.Args<
  typeof prisma.user_portfolio,
  "createMany"
>["data"];
