import { z } from "zod";
import { type FastifySchema } from "fastify";
import { ApiResponseSchema } from "@/utils/api-response";
import { responseProperty } from "@/constants";

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password too short"),
});

export const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password too short"),
});

export const authResData = z.object({
    accessToken: z.string(),
    exp: z.union([z.string(), z.number()]),
});

export type RegisterReq = z.infer<typeof registerSchema>;
export type LoginReq = z.infer<typeof loginSchema>;

export const LoginSchema: FastifySchema = {
    description: "Login api",
    tags: ["auth"],
    body: {
        type: "object",
        properties: {
            email: { type: "string" },
            password: { type: "string" },
        },
    },
    response: {
        200: {
            description: "Login successfully",
            type: "object",
            properties: {
                ...responseProperty,
                data: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        exp: { type: "number" },
                    },
                },
            },
        },

        400: {
            description: "Login failed",
            type: "object",
            properties: {
                ...responseProperty,
                data: { type: "null" },
            },
        },
    },
};
export const RegisterSchema: FastifySchema = {
    description: "Register api",
    tags: ["auth"],
    body: {
        type: "object",
        properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
        },
    },
    response: {
        201: {
            description: "Register successfully",
            type: "object",
            properties: {
                ...responseProperty,
                data: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        exp: { type: "number" },
                    },
                },
            },
        },
    },
};

export const RefreshTokenSchema: FastifySchema = {
    description: "Refresh token api",
    tags: ["auth"],
    response: {
        200: {
            description: "Refresh token success",
            type: "object",
            properties: {
                ...responseProperty,
                data: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        exp: { type: "number" },
                    },
                },
            },
        },
    },
};

export const GetCurrentSchema: FastifySchema = {
    description: "Get current user api",
    tags: ["auth"],
    security: [{ apiKey: [] }],
    response: {
        200: {
            description: "Get current user",
            type: "object",
            properties: {
                ...responseProperty,
                data: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        email_verified_at: { type: ["string", "null"] },
                    },
                },
            },
        },
    },
};

export const LogoutSchema: FastifySchema = {
    description: "Logout api",
    tags: ["auth"],
    security: [{ apiKey: [] }],
    response: {
        204: {
            description: "Logout successfully",
            type: "null",
        },
    },
};
