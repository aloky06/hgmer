import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

// The config will automatically pick up CLOUDINARY_URL or these specific variables if loaded.
// NestJS typically loads .env via ConfigModule, but since we are just doing a quick config:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'hgmer' },
        (error, result) => {
          if (error) return reject(new BadRequestException('Failed to upload image to Cloudinary'));
          resolve({ url: result.secure_url });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
