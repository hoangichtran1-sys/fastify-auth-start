import { responseProperty } from "@/constants";
import type { FastifySchema } from "fastify";
import { z } from "zod";

export const uploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB")
        .refine(
            (file) => file.type.startsWith("image/"),
            "Type image is required",
        ),
});

export const UploadSchema: FastifySchema = {
    description: "Upload image api",
    tags: ["upload"],
    body: {
        type: "object",
        properties: {
            file: {
                type: "array",
                properties: {
                    filename: { type: "string" },
                    mimetype: { type: "string" },
                },
            },
        },
    },
    response: {
        200: {
            description: "Upload file success",
            type: "object",
            properties: {
                ...responseProperty,
                data: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                        name: { type: "string" },
                    },
                },
            },
        },
    },
};
