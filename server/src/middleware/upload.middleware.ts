import multer from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Request } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// 1. Configure Cloudinary v2 SDK
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. Multer memory storage (keeps file in memory Buffer for streaming to Cloudinary)
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-tar",
  "application/gzip",
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed types: Images, PDF, Docs, and ZIP archives.`,
        400,
        "UNSUPPORTED_FILE_TYPE",
      ),
    );
  }
};

export const uploadDeliverableAsset = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter,
});

/**
 * Streams an in-memory buffer to Cloudinary targeting `/relayops/{tenantId}/deliverables`
 */
export const streamUploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        filename_override: fileName,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new AppError(
              `Cloudinary upload failed: ${error?.message || "Unknown error"}`,
              500,
              "CLOUDINARY_UPLOAD_ERROR",
            ),
          );
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};
