import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './entities/album.entity';
import { AlbumsService } from './albums/albums.service';
import { UsersModule } from 'src/users/users.module';
import { SongsService } from './songs/songs.service';
import { Song, SongSchema } from './entities/song.entity';
import { LikeService } from './likes/like.service';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { Like, LikeSchema } from './entities/song.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Album.name, schema: AlbumSchema, },
      { name: Song.name, schema: SongSchema },
      { name: User.name, schema: UserSchema }, //added OTHER MODULE BUT STILL FINE
      { name: Like.name, schema: LikeSchema }, //added
    ]),
    UsersModule,
  ],
  controllers: [MusicController],
  providers: [MusicService, AlbumsService, SongsService, LikeService],
})
export class MusicModule {}
