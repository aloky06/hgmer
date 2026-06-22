import { Controller, Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    // Dynamically construct URL based on the request's host
    const host = req.get('host') || 'localhost:3001';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
    return { url: fileUrl };
  }
}
