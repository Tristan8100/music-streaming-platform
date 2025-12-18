import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, UseInterceptors, UploadedFile, Request, UseGuards } from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateAlbumDto, CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { AlbumsService } from './albums/albums.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';
import { ValidationPipe } from '@nestjs/common';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private readonly albumsService: AlbumsService,
  ) {}

  //ALBUMS
  @UseGuards(AuthGuard, RolesGuard)
  @Post('albums')
  @UseInterceptors(FileInterceptor('file'))
  createAlbum(@Body() data: CreateAlbumDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.albumsService.createAlbum(data, req.user.id, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('albums-update/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateAlbum(@Param('id') id: string, @Body() data: CreateAlbumDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.albumsService.updateAlbum(id, data, req.user.id, file);
  }
  

}
