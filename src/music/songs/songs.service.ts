import { Injectable } from '@nestjs/common';
import { Album, AlbumDocument } from '../entities/album.entity';
import { Song, SongDocument } from '../entities/song.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class SongsService {
    constructor(
        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,
        @InjectModel(Album.name)
        private readonly albumModel: Model<AlbumDocument>,

        private readonly storageService: StorageService,
    ) {}

    async createSong(userId: string, data: any, albumId: string, file: Express.Multer.File): Promise<any> {
        //check user authorization to album
        const album = await this.albumModel.find({ _id: albumId, user: userId });
        if (!album) {
            throw new Error('Unauthorized to add song to this album');
        }
        //upload music file
        const musicPath = await this.storageService.upload('file_storage', `music/${Date.now()}-${file.originalname}`, file);
        //get music path
        const { path, local_path } = musicPath;
        //create song in db
        const parsedGenreSong = data.genre_song ? JSON.parse(data.genre_song as any) : [];
        const newSong = await this.songModel.create({
            name: data.name,
            song_local_path: local_path,
            song_url: path,
            album_id: albumId,
            genre_song: parsedGenreSong,
        });

        return {message: 'Song created successfully', data: newSong}; //to be implemented
    }
}
