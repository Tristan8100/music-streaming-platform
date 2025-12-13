import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FollowsService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async follow(followId: string, data: any): Promise<any> {
        if(followId === data.id) {
            throw new UnauthorizedException('You cannot follow yourself');
        } else if(!isValidObjectId(followId)) {
            throw new UnauthorizedException('Invalid user ID');
        }

        const user = await this.userModel.findOne({_id: followId }).exec();
        
        if(!user) {
            throw new NotFoundException(`User with ID ${followId} not found`);
        } else {
            const user = await this.userModel.findOne({_id: followId, followers: data.id }).exec();
            if(!user) {
                await this.userModel.updateOne({ _id: followId }, { $push: { followers: data.id } }).exec();
                await this.userModel.updateOne({ _id: data.id }, { $push: { follows: followId } }).exec();
            } if(user) {
                return { message: 'Already followed' };
            }
            return { message: 'Followed successfully' };
        }
    }
    
    async unFollow (followId: string, data: any): Promise<any> {
        if(followId === data.id) {
            throw new UnauthorizedException('You cannot unfollow yourself');
        } else if(!isValidObjectId(followId)) {
            throw new UnauthorizedException('Invalid user ID');
        }
        await this.userModel.updateOne({ _id: followId }, { $pull: { followers: data.id } }).exec();
        await this.userModel.updateOne({ _id: data.id }, { $pull: { follows: followId } }).exec();
        return { message: 'Unfollowed successfully' };
    }

    async getAllFollowers(id: string): Promise<any> {
        const user = await this.userModel.findOne({ _id: id }).populate('followers', 'name email photo_url').exec();
        if(!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user.followers;
    }
}
