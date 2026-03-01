import prisma from "../configs/prisma.config";
import { createManyPortfolio } from "../types/userPortfolio.types";
import { queryHandler } from "../utils/helper";

class UserPortfolioRepository {
  createMany = async (data: createManyPortfolio) => {
    return queryHandler(
      async () => await prisma.user_portfolio.createMany({ data })
    );
  };

  deleteMany = async (up_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_portfolio.deleteMany({
          where: { up_user_id },
        })
    );
  };
}

export default UserPortfolioRepository;
