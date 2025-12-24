import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Follow, FollowDocument, User, UserDocument } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import e from 'express';

@Injectable()
export class FollowsService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Follow.name)
        private readonly followModel: Model<FollowDocument>,
    ) {}

    async follow(followId: string, data: any): Promise<any> {
        //legend: data.id = auth, followId = params other human beings
        if(followId === data.id) {
            throw new UnauthorizedException('You cannot follow yourself');
        } else if(!isValidObjectId(followId)) {
            throw new UnauthorizedException('Invalid user ID');
        }

        const user = await this.userModel.findOne({_id: followId }).exec();
        
        if(!user) {
            throw new NotFoundException(`User with ID ${followId} not found`);
        } else {
            try {
                //LEGACY
                //await this.userModel.updateOne({ _id: followId }, { $push: { followers: data.id } }).exec();
                //await this.userModel.updateOne({ _id: data.id }, { $push: { follows: followId } }).exec();

                await this.followModel.create({ follower: data.id, following: followId });// if it errors, it means it already exists and transfer to catch
                await this.userModel.updateOne({ _id: followId }, { $inc: { followers_count: 1 } }).exec();
                await this.userModel.updateOne({ _id: data.id }, { $inc: { following_count: 1 } }).exec();
                return { message: 'Followed successfully' };
            } catch (error) {
                if(error.code === 11000) {
                    throw new UnauthorizedException('You are already following this user');
                } else {
                    throw new UnauthorizedException('Error following user');
                }
            }
        }
    }
    
    async unFollow (followId: string, data: any): Promise<any> {
        if(followId === data.id) {
            throw new UnauthorizedException('You cannot unfollow yourself');
        } else if(!isValidObjectId(followId)) {
            throw new UnauthorizedException('Invalid user ID');
        }
        //LEGACY
        //await this.userModel.updateOne({ _id: followId }, { $pull: { followers: data.id } }).exec();
        //await this.userModel.updateOne({ _id: data.id }, { $pull: { follows: followId } }).exec();

        const unfollow = await this.followModel.deleteOne({ follower: data.id, following: followId }).exec();
        if(unfollow.deletedCount === 0) {
            throw new NotFoundException(`Follow relationship not found`);
        }

        await this.userModel.updateOne({ _id: followId }, { $inc: { followers_count: -1}, $max: { followers_count: 0 } }).exec();//decrement on their followers
        await this.userModel.updateOne({ _id: data.id }, { $inc: { following_count: -1}, $max: { following_count: 0 } }).exec();//decrement on your following
        return { message: 'Unfollowed successfully' };
    }

    async getAllFollowers(id: string): Promise<any> {
        // id = auth
        //LEGACY
        //const user = await this.userModel.findOne({ _id: id }).populate('followers', 'name email photo_url').exec();
        const user = await this.followModel.find({ following: id }).populate('follower', 'name email photo_url').exec();
        if(!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async getAllFollowing(id: string): Promise<any> {
        const user = await this.followModel.find({ follower: id }).populate('following', 'name email photo_url').exec();
        if(!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
}
