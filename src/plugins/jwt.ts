import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyJwt, { type FastifyJWTOptions } from "@fastify/jwt";
import { env } from "@/configs/env";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { id: string };
        user: { id: string };
    }
}

async function jwtPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyJwt, {
        secret: env.JWT_SECRET,
        sign: {
            algorithm: "HS256",
            expiresIn: "15m",
        },
    } as FastifyJWTOptions);
}

export default fp(jwtPlugin);
