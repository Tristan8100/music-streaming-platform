import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StorageService } from './storage.service';


@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageService.remove(+id);
  }
}
