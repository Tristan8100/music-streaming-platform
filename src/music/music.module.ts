import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './entities/album.entity';
import { AlbumsService } from './albums/albums.service';
import { UsersModule } from 'src/users/users.module';
import { SongsService } from './songs/songs.service';
import { Song, SongSchema } from './entities/song.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Album.name, schema: AlbumSchema, },
      { name: Song.name, schema: SongSchema },
    ]),
    UsersModule,
  ],
  controllers: [MusicController],
  providers: [MusicService, AlbumsService, SongsService],
})
export class MusicModule {}
