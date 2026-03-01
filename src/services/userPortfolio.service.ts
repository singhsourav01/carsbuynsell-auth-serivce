import { INTEGERS } from "../constants/app.constant";
import UserPortfolioRepository from "../repositories/userPortfolio.repository";

class UserPortfolioService {
  userPortfolioRepository: UserPortfolioRepository;

  constructor() {
    this.userPortfolioRepository = new UserPortfolioRepository();
  }

  createPortfolio = async (user_id: any, portfolio_ids: string[]) => {
    if (!portfolio_ids) return [];

    await this.userPortfolioRepository.deleteMany(user_id);

    if (portfolio_ids.length === INTEGERS.ZERO) return [];

    const portfolios = portfolio_ids.map((item) => {
      return {
        up_user_id: user_id,
        up_file_id: item,
      };
    });
    return await this.userPortfolioRepository.createMany(portfolios);
  };
}

export default UserPortfolioService;
