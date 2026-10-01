import { type FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { type FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { env } from "./env";

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
    openapi: {
        openapi: "3.0.0",
        info: {
            title: "Fastify Auth",
            description: "Fastify Auth swagger API",
            version: "0.1.0",
        },
        servers: [
            {
                url: env.APP_URL,
                description: "Development server",
            },
        ],
        tags: [{ name: "Auth", description: "Auth related end-points" }],
        components: {
            securitySchemes: {
                apiKey: {
                    type: "apiKey",
                    name: "Authorization",
                    in: "header",
                },
            },
        },
        externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
        },
    },
};

export const swaggerUIConfigs: FastifySwaggerUiOptions = {
    routePrefix: "docs",
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    },
    uiHooks: {
        onRequest: function (_request, _reply, next) {
            next();
        },
        preHandler: function (_request, _reply, next) {
            next();
        },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
    },
    transformSpecificationClone: true,
};
