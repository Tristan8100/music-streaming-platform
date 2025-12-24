import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, UseInterceptors, UploadedFile, Request, UseGuards } from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateAlbumDto, CreateMusicDto, CreateSongsDto, UpdateAlbumDto, UpdateSongDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { AlbumsService } from './albums/albums.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { SongsService } from './songs/songs.service';
import { LikeService } from './likes/like.service';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private readonly albumsService: AlbumsService,
    private readonly songsService: SongsService,
    private readonly likeService: LikeService
  ) {}

  //ALBUMS
  @UseGuards(AuthGuard, RolesGuard)
  @Post('albums')
  @UseInterceptors(FileInterceptor('file')) // USE FILE INTERCEPTOR TO ALLOW VALIDATION ON DTO WHEN USING FORM-DATA REMEMBER!!!!!
  createAlbum(@Body() data: CreateAlbumDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log(data);
    return this.albumsService.createAlbum(data, req.user.id, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('albums-update/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateAlbum(@Param('id') id: string, @Body() data: UpdateAlbumDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.albumsService.updateAlbum(id, data, req.user.id, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('albums')
  showAllAlbums() {
    return this.albumsService.showAllAlbums();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('albums/:id')
  getAlbumById(@Param('id') id: string) {
    return this.albumsService.getAlbumById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('albums/:id')
  deleteAlbum(@Param('id') id: string, @Request() req) {
    return this.albumsService.deleteAlbum(id, req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('albums-user') //EXECUTE THE ROUTE WITHOUT PARAMS FIRST
  getAlbumsByAuthUserId(@Request() req) { //GET USER FROM REQ OBJECT/AUTHENTICATED USER
    return this.albumsService.getAlbumsByUserId(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('albums-user/:id') //GET USER BY ID IN PARAMS
  getAlbumsByUserId(@Param('id') id: string) {
    return this.albumsService.getAlbumsByUserId(id);
  }

  //SONGS
  @UseGuards(AuthGuard, RolesGuard)
  @Get('songs/:id') // THE ID IS SONG ID
  getSongById(@Param('id') id: string) {
    return this.songsService.getSongById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('songs/:id') // THE ID IS ALBUM ID
  @UseInterceptors(FileInterceptor('file'))
  createSong(@Body() data: CreateSongsDto, @Param('id') id: string, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.songsService.createSong(req.user.id, data, id, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Put('songs/:id') // THE ID IS SONG ID
  updateSong(@Body() data: UpdateSongDto, @Param('id') id: string, @Request() req) {
    return this.songsService.editSong(req.user.id, data, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('songs/:id') // THE ID IS SONG ID
  deleteSong(@Param('id') id: string, @Request() req) {
    return this.songsService.deleteSong(req.user.id, id);
  }

  //LIKES
  @UseGuards(AuthGuard, RolesGuard)
  @Post('songs-like/:id')
  likeSong(@Param('id') id: string, @Request() req) {
    return this.likeService.likeSong(req.user.id, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('songs-unlike/:id')
  unLikeSong(@Param('id') id: string, @Request() req) {
    return this.likeService.unLikeSong(req.user.id, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('songs-play/:id') //not yet tested
  getSongLikes(@Param('id') id: string) {
    return this.likeService.plays(id);
  }
  

}
