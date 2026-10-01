export const COOKIE_NAME = "refreskToken";
export const EXPIRES_ACCESS_TOKEN = Math.floor(Date.now() / 1000) + 60 * 15;

export const responseProperty = {
    success: { type: "boolean" },
    message: { type: "string" },
    statusCode: { type: "number" },
};
