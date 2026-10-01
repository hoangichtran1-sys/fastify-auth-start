import fastifyMultipart from "@fastify/multipart";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import cloudinary from "@/configs/cloudinary";
import { UploadSchema, uploadSchema } from "./upload.schema";
import { ApiError } from "@/utils/api-error";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@/utils/api-response";

export const uploadRouters = async (fastify: FastifyInstance) => {
    fastify.register(fastifyMultipart);

    fastify.post(
        "/image",
        { preHandler: [fastify.authenticate], schema: UploadSchema },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { file } = await uploadSchema.parseAsync(request.file());
            const arrayBuffer = await file.arrayBuffer();

            const uploadResult = await new Promise<UploadApiResponse>(
                (resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            { folder: "billboards" },
                            (
                                error: UploadApiErrorResponse | undefined,
                                result: UploadApiResponse | undefined,
                            ) => {
                                if (error) reject(error);
                                if (!result)
                                    return reject(
                                        ApiError.badRequest(
                                            "Failed to upload file",
                                        ),
                                    );
                                resolve(result);
                            },
                        )
                        .end(arrayBuffer);
                },
            );

            return reply.code(StatusCodes.OK).send(
                ApiResponse.success("Upload file success", {
                    url: uploadResult.secure_url,
                    name: uploadResult.original_filename,
                }),
            );
        },
    );
};
