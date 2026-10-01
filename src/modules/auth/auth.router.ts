import type { FastifyInstance } from "fastify";
import {
    getCurrent,
    login,
    logout,
    refreshToken,
    register,
} from "./auth.controller";
import {
    GetCurrentSchema,
    LoginSchema,
    LogoutSchema,
    RefreshTokenSchema,
    RegisterSchema,
} from "./auth.schema";

export const authRouters = async (fastify: FastifyInstance) => {
    // POST /register
    fastify.post("/register", { schema: RegisterSchema }, register);

    // POST /login
    fastify.post("/login", { schema: LoginSchema }, login);

    // POST /logout
    fastify.post(
        "/logout",
        { schema: LogoutSchema, onRequest: [fastify.authenticate] },
        logout,
    );

    // GET /current
    fastify.get(
        "/current",
        { schema: GetCurrentSchema, onRequest: [fastify.authenticate] },
        getCurrent,
    );

    // GET /refresh-token
    fastify.get("/refresh-token", { schema: RefreshTokenSchema }, refreshToken);
};
