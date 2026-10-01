import fs from "fs";
import Fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import { fastifyCookie, type FastifyCookieOptions } from "@fastify/cookie";
import { fastifyHelmet } from "@fastify/helmet";
// import { fastifyMultipart } from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { fastifyRateLimit } from "@fastify/rate-limit";

import jwtPlugin from "@/plugins/jwt";
import authPlugin from "@/plugins/authenticate";

import { env } from "@/configs/env";
import { logger, logDir } from "@/configs/logger";
import { globalRateLimiter } from "@/configs/rate-limit";
import { swaggerConfig, swaggerUIConfigs } from "@/configs/swagger";
import { notFoundHandler } from "@/utils/not-found-handler";
import { errorHandler } from "@/utils/error-handler";
import { authRouters } from "@/modules/auth/auth.router";
import { uploadRouters } from "@/modules/upload/upload.router";

// declare module "fastify" {
//     interface FastifyRequest {
//         userId?: string;
//     }
// }

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const fastify = Fastify({ logger: true });

const start = async () => {
    await fastify.register(fastifyCors, {
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    });

    await fastify.register(fastifyCookie, {
        secret: env.COOKIE_SECRET,
        hook: "onRequest",
    } as FastifyCookieOptions);

    await fastify.register(fastifyHelmet);

    await fastify.register(jwtPlugin);

    // await fastify.register(fastifyMultipart);

    await fastify.register(fastifyRateLimit, globalRateLimiter);

    await fastify.register(swagger, swaggerConfig);

    await fastify.register(swaggerUI, swaggerUIConfigs);

    fastify.setNotFoundHandler(notFoundHandler);

    fastify.setErrorHandler(errorHandler);

    await fastify.register(authPlugin);

    await fastify.register(authRouters, { prefix: "/api/auth" });

    await fastify.register(uploadRouters, { prefix: "/api/upload" });

    await fastify.ready();

    fastify.swagger();

    await fastify.listen({ port: env.PORT, host: env.HOST });

    logger.info(
        `Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`,
    );
};

start()
    .then(() => console.log(`🚀 Server is running at ${env.PORT}`))
    .catch((err) => {
        logger.error(err, "Server running failed.");
        console.log(err);
        process.exit(1);
    });

const onCloseSignal = () => {
    logger.info("Sigint received, shutting down");

    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
