import prisma from "../configs/prisma.config";
import { createSmsType, updateSmsType } from "../types/sms.types";
import { queryHandler } from "../utils/helper";

class SmsRepository {
  create = async (data: createSmsType) => {
    return queryHandler(async () => await prisma.sms_otp.create({ data }));
  };

  update = async (so_id: string, data: updateSmsType) => {
    return queryHandler(
      async () => await prisma.sms_otp.update({ where: { so_id }, data })
    );
  };

  getByPhone = async (so_receiver: string) => {
    return queryHandler(
      async () =>
        await prisma.sms_otp.findFirst({
          where: { so_receiver },
          orderBy: {
            so_created_at: "desc",
          },
          take: 1,
        })
    );
  };

  incrementAttempts = async (so_id: string) => {
    return queryHandler(
      async () =>
        await prisma.sms_otp.update({
          where: { so_id },
          data: { so_attempts: { increment: 1 } },
        })
    );
  };
}

export default SmsRepository;
