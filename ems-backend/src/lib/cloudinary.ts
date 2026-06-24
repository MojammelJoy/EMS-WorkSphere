import { v2 as cloudinary } from "cloudinary";
import { config } from "@/config";
import type { UploadedFile } from "@/types";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key:    config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure:     true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "auto" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          format:   result.format,
          size:     result.bytes,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
