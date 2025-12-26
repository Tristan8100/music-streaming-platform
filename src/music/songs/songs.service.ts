import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Album, AlbumDocument } from '../entities/album.entity';
import { Song, SongDocument } from '../entities/song.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { ObjectId } from 'mongodb';
import { CreateSongsDto, UpdateSongDto } from '../dto/create-music.dto';
import { Not } from 'typeorm';

@Injectable()
export class SongsService {
    constructor(
        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,
        @InjectModel(Album.name)
        private readonly albumModel: Model<AlbumDocument>,

        private readonly storageService: StorageService,
    ) {}

    async createSong(userId: string, data: CreateSongsDto, albumId: string, file: Express.Multer.File): Promise<any> {
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
            user_id: userId, //added new
            genre_song: parsedGenreSong,
        });

        return {message: 'Song created successfully', data: newSong}; //to be implemented
    }

    async editSong(userId: string, data: UpdateSongDto, idSong: string): Promise<any> {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(idSong)) {
            throw new BadRequestException('Invalid ID');
        }

        try {
            const song = await this.songModel.findOneAndUpdate({ _id: idSong, user_id: userId }, 
                {
                    name: data.name,
                    genre_song: data.genre_song, //the data.genre songs can be the old one, it will just returned on the frontend and handle it, every request will rewrite the genre_song
                },              //don't parse if using json
                { new: true } //return the updated document
            );

            if (!song) {
                throw new BadRequestException('Song not found or unauthorized');
            }

            return { message: 'Song updated successfully', data: song };

        } catch (error) {
            throw new BadRequestException('Error updating song' + error.message);
        }
    }

    async getSongById(id: string): Promise<any> {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ID');
        }
        const song = await this.songModel.findById(id).populate('album_id').populate('user_id').exec();
        if (!song) {
            throw new NotFoundException('Song not found');
        }
        return song;
    }

    async deleteSong(userId: string, idSong: string): Promise<any> {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(idSong)) {
            throw new BadRequestException('Invalid ID');
        }
        const songData = await this.songModel.findOne({ _id: idSong, user_id: userId }).exec();
        if (!songData) {
            throw new BadRequestException('Song not found or unauthorized');
        }
        //delete from storage
        if (songData.song_local_path) {
            await this.storageService.delete('file_storage', songData.song_local_path);

            //delete from db
            const song = await this.songModel.findOneAndDelete({ _id: idSong, user_id: userId });
            if (!song) {
                throw new BadRequestException('Song not found or unauthorized');
            }
        }
        
        return { message: 'Song deleted successfully' };
    }
}
