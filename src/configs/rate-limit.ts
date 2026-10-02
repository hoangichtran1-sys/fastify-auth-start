import { StatusCodes } from "http-status-codes";
import type { RateLimitOptions } from "@fastify/rate-limit";
import { ApiResponse } from "@/utils/api-response";

export const globalRateLimiter: RateLimitOptions = {
    max: 600,
    timeWindow: "15 minute",
    keyGenerator: (req) => req.user.id || req.ip,
    errorResponseBuilder: (req) =>
        ApiResponse.failure(
            `Too many requests from this IP ${req.ip}, please try again after 15 minutes.`,
            null,
            StatusCodes.TOO_MANY_REQUESTS,
        ),
};

export const loginRateLimiter: RateLimitOptions = {
    max: 6,
    timeWindow: "15 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req) =>
        ApiResponse.failure(
            "Too many login attempts, please try again later.",
            null,
            StatusCodes.TOO_MANY_REQUESTS,
        ),
};

export const registerRateLimiter: RateLimitOptions = {
    max: 6,
    timeWindow: "15 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req) =>
        ApiResponse.failure(
            "Too many registration attempts, please try again later.",
            null,
            StatusCodes.TOO_MANY_REQUESTS,
        ),
};
