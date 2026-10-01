import { ApiResponse } from "@/utils/api-response";
import type { RateLimitOptions } from "@fastify/rate-limit";
import { StatusCodes } from "http-status-codes";

export const globalRateLimiter: RateLimitOptions = {
    max: 600,
    timeWindow: "15 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (req) =>
        ApiResponse.failure(
            `Too many requests from this IP ${req.ip}, please try again after 15 minutes.`,
            null,
            StatusCodes.TOO_MANY_REQUESTS,
        ),
};
