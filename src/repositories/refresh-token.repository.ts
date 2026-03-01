import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";

class RefreshTokenRepository {
    create = async (data: {
        rt_user_id: string;
        rt_token: string;
        rt_expires_at: Date;
    }) => {
        return queryHandler(
            async () => await prisma.refresh_tokens.create({ data })
        );
    };

    findByToken = async (rt_token: string) => {
        return queryHandler(
            async () =>
                await prisma.refresh_tokens.findFirst({
                    where: { rt_token },
                })
        );
    };

    revokeByToken = async (rt_token: string) => {
        return queryHandler(
            async () =>
                await prisma.refresh_tokens.updateMany({
                    where: { rt_token },
                    data: { rt_is_revoked: true },
                })
        );
    };

    revokeAllForUser = async (rt_user_id: string) => {
        return queryHandler(
            async () =>
                await prisma.refresh_tokens.updateMany({
                    where: { rt_user_id },
                    data: { rt_is_revoked: true },
                })
        );
    };
}

export default RefreshTokenRepository;
