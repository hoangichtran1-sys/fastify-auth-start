import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

import { ApiResponse } from "./api-response";
import { ApiError } from "./api-error";

export const errorHandler = (
    error: FastifyError,
    _request: FastifyRequest,
    reply: FastifyReply,
) => {
    if (error instanceof ZodError) {
        const errors = error?.issues?.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        const apiResponse = ApiResponse.failure(
            "Validation failed",
            errors,
            StatusCodes.BAD_REQUEST,
        );
        return reply.code(apiResponse.statusCode).send(apiResponse);
    }

    if (error instanceof ApiError) {
        const apiResponse = ApiResponse.failure(
            error.message,
            error.errors || null,
            error.statusCode,
        );
        return reply.code(apiResponse.statusCode).send(apiResponse);
    }

    if (error instanceof TypeError) {
        const apiResponse = ApiResponse.failure(
            error.message,
            null,
            error.statusCode,
        );
        return reply.code(apiResponse.statusCode).send(apiResponse);
    }

    if (error.validation || error.code?.startsWith("FST_")) {
        const apiResponse = ApiResponse.failure(
            error.message,
            error.validation || error.code,
            error.statusCode || StatusCodes.BAD_REQUEST,
        );
        return reply.code(apiResponse.statusCode).send(apiResponse);
    }

    return reply
        .code(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
            ApiResponse.failure(
                "Something went wrong",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            ),
        );
};
