import type { CookieSerializeOptions } from "@fastify/cookie";
import { env } from "./env";

export const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 3600,
    path: "/",
    secure: env.NODE_ENV === "production",
    domain: env.HOST,
    signed: true,
};
