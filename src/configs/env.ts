import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("production"),

    HOST: z.string().min(1).default("localhost"),

    PORT: z.coerce.number().int().positive().default(5000),

    APP_URL: z.url().default("http://localhost:5000"),

    COOKIE_SECRET: z.string().min(6),

    JWT_SECRET: z.string().min(10),

    EMAIL_ADMIN: z.email(),

    CORS_ORIGIN: z.url().default("http://localhost:5000"),

    DATABASE_URL: z.string().min(1),

    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int(),
    SMTP_USER: z.email(),
    SMTP_PASS: z.string().min(1),
    EMAIL_FROM: z.email(),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "❌ Invalid environment variables:",
        parsedEnv.error.format(),
    );
    throw new Error("Invalid environment variables");
}

export const env = {
    ...parsedEnv.data,
    isDevelopment: parsedEnv.data.NODE_ENV === "development",
    isProduction: parsedEnv.data.NODE_ENV === "production",
    isTest: parsedEnv.data.NODE_ENV === "test",
};
