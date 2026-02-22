import prisma from "../configs/prisma.config";
import { createEmailType, updateEmailType } from "../types/email.types";
import { queryHandler } from "../utils/helper";

class EmailRepository {
  create = async (data: createEmailType) => {
    return queryHandler(async () => await prisma.email_otp.create({ data }));
  };

  update = async (eo_id: string, data: updateEmailType) => {
    return queryHandler(
      async () =>
        await prisma.email_otp.update({ where: { eo_id }, data: data })
    );
  };

  getByEmail = async (eo_receiver: string) => {
    return queryHandler(
      async () =>
        await prisma.email_otp.findFirst({
          where: { eo_receiver },
          orderBy: {
            eo_created_at: "desc",
          },
          take: 1,
        })
    );
  };
}

export default EmailRepository;
