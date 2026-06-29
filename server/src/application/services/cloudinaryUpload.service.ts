import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export function subirBufferACloudinary(params: {
  buffer: Buffer;
  folder: string;
  resourceType?: 'image' | 'raw' | 'auto';
}): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: params.folder,
        resource_type: params.resourceType ?? 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error('Cloudinary no retornó secure_url.'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    Readable.from(params.buffer).pipe(uploadStream);
  });
}
