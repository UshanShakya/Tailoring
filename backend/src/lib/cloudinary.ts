import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if environment variables exist
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export async function uploadImageToCloudinary(
  fileBase64: string,
  folder: string = 'tailoring_logos'
): Promise<{ url: string; publicId: string }> {
  const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder,
        resource_type: 'image',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err: any) {
      console.warn('[Cloudinary Upload Warning]', err.message || err);
    }
  }

  // Fallback: If Cloudinary credentials are not set, return base64 data URL directly
  return {
    url: fileBase64,
    publicId: `base64_${Date.now()}`,
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  if (isCloudinaryConfigured && publicId && !publicId.startsWith('base64_')) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (err: any) {
      console.warn('[Cloudinary Delete Warning]', err.message || err);
    }
  }
  return true;
}
