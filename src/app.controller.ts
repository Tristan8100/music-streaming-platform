
import { AppService } from './app.service';

import { Controller, Post, UploadedFile, UseInterceptors, Get, Delete, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage/storage.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly storageService: StorageService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  //TEST UPLOAD
  @Post('try')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }

    const data = await this.storageService.upload(
      'file_storage', // Supabase bucket can be env
      `try/${Date.now()}-${file.originalname}`,
      file,
    );

    return {
      message: 'File uploaded successfully',
      data: data.data,
      url: data.path,
      bucket: 'file_storage',
    };
  }

  @Delete('try')
  async remove(@Body('path') path: string) {
    return this.storageService.delete('file_storage', path);
  }
}
