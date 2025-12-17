import { Injectable, NotFoundException } from '@nestjs/common';
import { Album, AlbumDocument } from '../entities/album.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAlbumDto } from '../dto/create-music.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class AlbumsService {
    constructor(
        @InjectModel(Album.name)
        private readonly albumModel: Model<AlbumDocument>,

        private readonly storageService: StorageService,
    ) {}

    async createAlbum(data: CreateAlbumDto, userId: string, file: Express.Multer.File): Promise<any> {
        //upload photo
        //create album
        return { message: 'Album created successfully' };
    }
}
