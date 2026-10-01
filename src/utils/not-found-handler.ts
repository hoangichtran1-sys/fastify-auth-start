import { StatusCodes } from "http-status-codes";
import type { FastifyReply, FastifyRequest } from "fastify";

import { ApiResponse } from "./api-response";

export const notFoundHandler = (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return reply
        .status(StatusCodes.NOT_FOUND)
        .send(
            ApiResponse.failure(
                `Route ${request.method} ${request.originalUrl} not found`,
                null,
                StatusCodes.NOT_FOUND,
            ),
        );
};
