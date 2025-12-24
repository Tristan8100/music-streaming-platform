import { BadRequestException, Injectable } from '@nestjs/common';
import { Album, AlbumDocument } from '../entities/album.entity';
import { Song, SongDocument } from '../entities/song.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { ObjectId } from 'mongodb';
import { CreateSongsDto, UpdateSongDto } from '../dto/create-music.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Like, LikeDocument } from '../entities/song.entity';

@Injectable()
export class LikeService {
    constructor(
        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,
        @InjectModel(Album.name)
        private readonly albumModel: Model<AlbumDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Like.name)
        private readonly likeModel: Model<LikeDocument>,

        private readonly storageService: StorageService,
    ) {}

    async likeSong(userId, songId)  {
        //userId from req.user.id, songId from params
        if(!ObjectId.isValid(userId) || !ObjectId.isValid(songId)) {
            throw new BadRequestException('Invalid ID');
        }

        //check if exist
        const exist = await this.songModel.findOne({ _id: songId });
        if (!exist) {
            throw new BadRequestException('Song not found');
        }

        try {
            const newLike = await this.likeModel.create({ user_id: userId, song_id: songId });
            const song = await this.songModel.findOneAndUpdate({ _id: songId }, { $inc: { likes_count: 1 }, $max: { likes_count: 0 } }, { new: true });
            return { message: 'Song liked successfully', data: newLike, song: song };
        } catch (error) {
            if (error.code === 11000) {
                return { message: 'Song already liked' };
            } else {
                throw new BadRequestException('Error liking song');
            }
        }
    }

    async unLikeSong(userId, songId)  {
        //userId from req.user.id, songId from params
        if(!ObjectId.isValid(userId) || !ObjectId.isValid(songId)) {
            throw new BadRequestException('Invalid ID');
        }

        const like = await this.likeModel.findOneAndDelete({ user_id: userId, song_id: songId });
        if (!like) {
            throw new BadRequestException('Song not found');
        }
        const song = await this.songModel.findOneAndUpdate({ _id: songId }, { $inc: { likes_count: -1 }, $max: { likes_count: 0 } }, { new: true });
        if (!song) {
            throw new BadRequestException('Song not found');
        }

        return { message: 'Song unliked successfully', data: like, song: song };
    }

    async plays(songId)  {
        //songId from params
        if(!ObjectId.isValid(songId)) {
            throw new BadRequestException('Invalid ID');
        }

        const song = await this.songModel.findOneAndUpdate({ _id: songId}, { $inc: { plays_count: 1 }, $max: { plays_count: 0 } }, { new: true });
        if (!song) {
            throw new BadRequestException('Song not found');
        }
        return { message: 'Song played successfully', data: song };
    }

    
}
