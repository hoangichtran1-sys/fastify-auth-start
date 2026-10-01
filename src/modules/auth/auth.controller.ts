import { StatusCodes } from "http-status-codes";
import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "@/configs/env";
import { cookieOptions } from "@/configs/cookie-options";
import { ApiResponse } from "@/utils/api-response";
import { COOKIE_NAME, EXPIRES_ACCESS_TOKEN } from "@/constants";
import {
    loginSchema,
    registerSchema,
    type LoginReq,
    type RegisterReq,
} from "./auth.schema";
import { AuthService } from "./auth.service";
import { ApiError } from "@/utils/api-error";

export const register = async (
    req: FastifyRequest<{ Body: RegisterReq }>,
    reply: FastifyReply,
) => {
    const bodyParse = await registerSchema.parseAsync(req.body);

    const { newUser, refreshToken } = await AuthService.register(bodyParse);

    const accessToken = await reply.jwtSign({ id: newUser.id });

    const apiResponse = ApiResponse.success(
        "Register successfully",
        { accessToken, exp: EXPIRES_ACCESS_TOKEN },
        StatusCodes.CREATED,
    );

    reply.setCookie(COOKIE_NAME, refreshToken, cookieOptions);

    return reply.code(apiResponse.statusCode).send(apiResponse);
};

export const login = async (
    req: FastifyRequest<{ Body: LoginReq }>,
    reply: FastifyReply,
) => {
    const bodyParse = await loginSchema.parseAsync(req.body);

    const { user, refreshToken } = await AuthService.login(bodyParse);

    const accessToken = await reply.jwtSign({ id: user.id });

    const apiResponse = ApiResponse.success(
        "Login successfully",
        { accessToken, exp: EXPIRES_ACCESS_TOKEN },
        StatusCodes.OK,
    );

    reply.setCookie(COOKIE_NAME, refreshToken, cookieOptions);

    return reply.code(apiResponse.statusCode).send(apiResponse);
};

export const logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user.id;

    await AuthService.logout(userId);

    reply.clearCookie(COOKIE_NAME, {
        path: "/",
        domain: env.HOST,
        httpOnly: true,
        secure: env.NODE_ENV === "production",
    });

    return reply.code(StatusCodes.NO_CONTENT).send();
};

export const getCurrent = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user.id;

    const user = await AuthService.getCurrent(userId);

    const apiResponse = ApiResponse.success(
        "Get current user",
        user,
        StatusCodes.OK,
    );

    return reply.code(apiResponse.statusCode).send(apiResponse);
};

export const refreshToken = async (
    req: FastifyRequest,
    reply: FastifyReply,
) => {
    const rawCookieValue = req.cookies[COOKIE_NAME];
    if (!rawCookieValue) {
        throw ApiError.notFound("Missing refresh token");
    }
    const oldRefreshToken = req.unsignCookie(rawCookieValue);

    if (!oldRefreshToken.valid) {
        throw ApiError.unauthorized("Refersh token invalid");
    }

    const newRefreshData = await AuthService.refreshToken(
        oldRefreshToken.value,
    );

    const newAccessToken = await reply.jwtSign({ id: newRefreshData.user_id });

    const apiResponse = ApiResponse.success("Refresh token success", {
        accessToken: newAccessToken,
        exp: EXPIRES_ACCESS_TOKEN,
    });

    reply.setCookie(COOKIE_NAME, newRefreshData.token, cookieOptions);

    return reply.code(apiResponse.statusCode).send(apiResponse);
};
