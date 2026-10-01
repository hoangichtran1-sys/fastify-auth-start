import argon2 from "argon2";
import { nanoid } from "nanoid";
import { addDays, addMinutes, isAfter } from "date-fns";
import { db } from "@/configs/db";
import { ApiError } from "@/utils/api-error";
import type { LoginReq, RegisterReq } from "./auth.schema";

export class AuthService {
    static async register(body: RegisterReq) {
        const { name, email, password } = body;

        const [existingUser] = await db
            .selectFrom("users")
            .select("users.id")
            .where("email", "=", email)
            .execute();

        if (existingUser) {
            throw ApiError.conflict("User already exists");
        }

        const hashPassword = await argon2.hash(password);

        const newUser = await db
            .insertInto("users")
            .values({
                name,
                email,
                password: hashPassword,
            })
            .returning(["id", "email"])
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("Failed to create user"),
            );

        const refreshToken = nanoid();

        await db
            .insertInto("refresh_tokens")
            .values({
                user_id: newUser.id,
                token: refreshToken,
                expires_at: addDays(new Date(), 7),
            })
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("Failed to create token"),
            );

        return { newUser, refreshToken };
    }

    static async login(body: LoginReq) {
        const { email, password } = body;

        const [user] = await db
            .selectFrom("users")
            .select(["id", "password"])
            .where("email", "=", email)
            .execute();

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        const isValidPassword = await argon2.verify(user.password, password);

        if (!isValidPassword) {
            throw ApiError.unauthorized("Invalid credentials");
        }

        const refreshToken = nanoid();

        await db
            .insertInto("refresh_tokens")
            .values({
                user_id: user.id,
                token: refreshToken,
                expires_at: addDays(new Date(), 7),
            })
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("Failed to create token"),
            );

        return { user, refreshToken };
    }

    static async logout(userId: string) {
        await db
            .updateTable("refresh_tokens")
            .set({
                revoked: true,
                updated_at: new Date(),
            })
            .where("user_id", "=", userId)
            .where("revoked", "=", false)
            .execute();
    }

    static async getCurrent(userId: string) {
        return await db
            .selectFrom("users")
            .select(["id", "email", "name", "email_verified_at"])
            .where("id", "=", userId)
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("User not found"),
            );
    }

    static async refreshToken(token: string) {
        const now = new Date();

        const [refreshData] = await db
            .selectFrom("refresh_tokens")
            .selectAll()
            .where("token", "=", token)
            .execute();

        if (!refreshData) {
            throw ApiError.notFound("Refresh token data not found");
        }

        if (refreshData.revoked || isAfter(now, refreshData.expires_at)) {
            throw ApiError.unauthorized(
                "Refresh token has expired or is revoke",
            );
        }

        const newRefreshToken = nanoid();

        const newRefreshData = await db
            .insertInto("refresh_tokens")
            .values({
                user_id: refreshData.user_id,
                token: newRefreshToken,
                expires_at: addDays(now, 7),
            })
            .returning(["id", "user_id", "token"])
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("Failed to create new token"),
            );

        await db
            .updateTable("refresh_tokens")
            .set({
                expires_at: addMinutes(now, 3),
                replaced_by: newRefreshData.id,
                revoked: true,
            })
            .where("id", "=", refreshData.id)
            .executeTakeFirstOrThrow(() =>
                ApiError.badRequest("Failed to update old token"),
            );

        return newRefreshData;
    }
}
