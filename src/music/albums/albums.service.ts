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

    async createAlbum(data: any, userId: string, file: Express.Multer.File): Promise<any> {
        //upload photo
        const photo = await this.storageService.upload(
            'file_storage', // Supabase bucket put to env
            `try/${Date.now()}-${file.originalname}`,
            file,
        );
        //create album
        const arr = JSON.parse(data.genre_album as any); //considered as string idk why just fcking parse it
        console.log(data.genre_album);
        const album = await this.albumModel.create({
            title: data.title,
            description: data.description,
            owner: userId,
            genre_album: arr,
            photo_local_path: photo.path,
            photo_url: photo.local_path,
        });
        return { message: 'Album created successfully', album };
    }

    async updateAlbum(id: string, data: CreateAlbumDto, userId: string, file?: Express.Multer.File): Promise<any> {
        //find album
        const album = await this.albumModel.findById(id);
        if (!album) {
            throw new NotFoundException('Album not found');
        }
        const arr = JSON.parse(data.genre_album as any);
        let datas; // delare heree
        //check photo
        if (file) {
            //delete old photo if exists
            this.storageService.delete(
                'file_storage',
                album.photo_url as string,
            );
            if (album.photo_local_path) {
                await this.albumModel.updateOne({ _id: id }, {$unset:{
                    photo_local_path: "",
                    photo_url: "",
                }}
             );
            }
            //upload new photo
            const photo = await this.storageService.upload(
                'file_storage', // Supabase bucket put to env
                `try/${Date.now()}-${file.originalname}`,
                file,
            );
            //update album
            datas = await this.albumModel.updateOne(
                { _id: id },
                {
                    $set: {
                        title: data.title,
                        description: data.description,
                        owner: userId,
                        genre_album: arr,
                        photo_local_path: photo.path,
                        photo_url: photo.local_path,
                    },
                }
            );
        }
        
        //response
        return { message: 'Album updated successfully', album: datas };
    }
}
