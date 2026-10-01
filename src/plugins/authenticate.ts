import fp from "fastify-plugin";
import { StatusCodes } from "http-status-codes";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { logger } from "@/configs/logger";
import { ApiResponse } from "@/utils/api-response";

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply,
        ) => Promise<void>;
    }
}
const authPlugin = async (fasitfy: FastifyInstance) => {
    fasitfy.decorate(
        "authenticate",
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                logger.error(err, "Jwt verify failed");
                return reply
                    .code(StatusCodes.UNAUTHORIZED)
                    .send(
                        ApiResponse.failure(
                            "Access token has expired or is invalid",
                            null,
                            StatusCodes.UNAUTHORIZED,
                        ),
                    );
            }
        },
    );
};

export default fp(authPlugin);
