import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateAlbumDto, CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { AlbumsService } from './albums/albums.service';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private readonly albumsService: AlbumsService,
  ) {}

  //ALBUMS
  @Post('albums')
  createAlbum(@Body() data: any, userId: string, file: Express.Multer.File) {
    return this.albumsService.createAlbum(data, userId, file);
  }
  

}
