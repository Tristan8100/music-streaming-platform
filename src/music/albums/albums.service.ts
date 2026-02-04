import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Album, AlbumDocument } from '../entities/album.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAlbumDto, UpdateAlbumDto } from '../dto/create-music.dto';
import { StorageService } from 'src/storage/storage.service';
import { FollowsService } from 'src/users/follows/follows.service';
import { Song, SongDocument } from '../entities/song.entity';
import { ObjectId } from 'typeorm';

@Injectable()
export class AlbumsService {
    constructor(
        //MODELS
        @InjectModel(Album.name)
        private readonly albumModel: Model<AlbumDocument>,

        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,

        //SERVICES
        private readonly storageService: StorageService,

        private readonly followsService: FollowsService
    ) {}

    async createAlbum(data: any, userId: string, file: Express.Multer.File): Promise<any> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException('Invalid ID');
        }
        if (!file) {
            throw new BadRequestException('File is required');
        }
        //upload photo
        const photo = await this.storageService.upload(
            'file_storage', // Supabase bucket put to env
            `try/${Date.now()}-${file.originalname}`,
            file,
        );
        //create album
        const arr = data.genre_album ? JSON.parse(data.genre_album as any) : []; //considered as string idk why just fcking parse it
        console.log(data.genre_album); //FIX VULNERABILITIES
        const album = await this.albumModel.create({
            title: data.title,
            description: data.description,
            owner: userId,
            genre_album: arr,
            photo_local_path: photo.local_path,
            photo_url: photo.path,
        });
        return { message: 'Album created successfully', album };
    }

    async updateAlbum(id: string, data: UpdateAlbumDto, userId: string, file?: Express.Multer.File): Promise<any> {
        if (!isValidObjectId(userId) || !isValidObjectId(id)) {
            throw new BadRequestException('Invalid ID');
        }
        //find album
        const album = await this.albumModel.findById(id);
        if (!album) {
            throw new NotFoundException('Album not found');
        }
        const arr = JSON.parse(data.genre_album as any); //FIX VULNERABILITIES
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
        } else {
            //update album without photo
            datas = await this.albumModel.updateOne(
                { _id: id },
                { $set: {
                        title: data.title,
                        description: data.description,
                        owner: userId,
                        genre_album: arr,
                    }
                }
            );
        }
        
        //response
        return { message: 'Album updated successfully', album: datas };
    }

    //get overall albums
    async showAllAlbums(page: number) {
        const skip = (page - 1) * 10;

        const [albums, total] = await Promise.all([
            this.albumModel //albums
            .find()
            .populate('owner', 'name photo_url email')
            .skip(skip)
            .limit(10)
            .sort({ createdAt: -1 })
            .exec(),
            this.albumModel.countDocuments(), //total
        ]);

        return {
            data: albums,
            meta: {
            total,
            page,
            lastPage: Math.ceil(total / 10),
            },
        };
    }


    //get one album by id
    async getAlbumById(id: string): Promise<any> {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Album not found');
        }
        const data = await this.albumModel.findById(id).populate('owner', 'name photo_url email').exec();
        if (!data) {
            throw new NotFoundException('Album not found');
        }
        return data;
    }

    //get albums by user id, can also be used to get own albums
    async getAlbumsByUserId(id: string): Promise<any> {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Album not found');
        }
        const data = await this.albumModel.find({ owner: id }).populate('owner', 'name photo_url email').exec();

        if (!data) {
            throw new NotFoundException('Album not found');
        }

        return data;
    }

    //delete album
    async deleteAlbum(id: string, userId: string): Promise<any> {
        if (!isValidObjectId(userId) || !isValidObjectId(id)) {
            throw new NotFoundException('error not valid');
        }
        const data = await this.albumModel.findOne({ _id: id, owner: userId }).exec();
        if (!data) {
            throw new NotFoundException('Album not found or you are not the owner');
        }

        //delete photo from storage if exists
        if (data.photo_local_path) {
            console.log('deleting photo from storage', data.photo_local_path);
            await this.storageService.delete('file_storage', data.photo_local_path);
        }

        //DELETE THE SONGS PAG MERON
        const songsCount = await this.songModel.countDocuments({ album_id: id }).exec();
        if (songsCount > 0) {
            throw new BadRequestException('Album has songs, delete them first');
        }

        await this.albumModel.deleteOne({ _id: id, owner: userId }).exec();

        return { message: 'Album deleted successfully' };
    }

    async getAlbumsAndSongs(id: string): Promise<any> {
        if(!isValidObjectId(id)){
            throw new BadRequestException('Invalid ID');
        }

        const data = await this.albumModel.findById(id).exec(); // no populate because the fk is on the songs

        if (!data) {
            throw new NotFoundException('Album not found');
        }

        const songs = await this.songModel.find({ album_id: id }).exec();
        const newData = { data, songs };

        return newData;
    }

    async getAlbumsFromFollowing(id: string): Promise<any> {
        if(!isValidObjectId(id)){
            throw new BadRequestException('Invalid ID');
        }

        const data = await this.followsService.getAllFollowing(id);

        return data;
    }
}
