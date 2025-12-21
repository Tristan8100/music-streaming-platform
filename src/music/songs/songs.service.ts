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

        private readonly storageService: StorageService,
    ) {}

    async createSong(data: any, albumId: string, file: Express.Multer.File): Promise<any> {
        return {message: 'Song created successfully'}; //to be implemented
    }
}
