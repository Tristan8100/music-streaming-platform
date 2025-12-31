import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassword, UpdateProfile, UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly storageService: StorageService,
  ) {}

  private async checkEmailExists(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const query: any = { email };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existingUser = await this.userModel.findOne(query).exec();

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    await this.checkEmailExists(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.userModel.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      email_verified_at: null,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.findOne(id);

    if (updateUserDto.email) {
      await this.checkEmailExists(updateUserDto.email, user._id.toString());
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return user.save();
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.deleteOne();
  }


  //SETTINGS
  async updateName(id: string, updateUserDto: UpdateProfile) {
    return this.userModel.updateOne({ _id: id }, { $set: updateUserDto }).exec();
  }

  async updatePassword(userId: string, dto: UpdatePassword) {
    const { currentPassword, password, confirmPassword } = dto;

    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Password updated successfully' };
  }

  async updateProfile(id: string, data: Express.Multer.File){
    //get user
    const user = await this.userModel.findById(id).exec();
    //check profile path
    if(user && user.photo_local_path && user.photo_url){
      //if exist delete old
      await this.storageService.delete('file_storage', user.photo_local_path);

      await this.userModel.updateOne({ _id: id }, { $unset: { photo_url: "", photo_local_path: "" } }).exec();
    }
    
    //add new
    const newData = await this.storageService.upload(
      'file_storage', // Supabase bucket can be env
      `profile-pictures/${Date.now()}-${data.originalname}`,
      data,
    );

    //update user with new data
    return this.userModel.updateOne(
      { _id: id },
      {
        $set: {
          photo_local_path: newData.local_path,
          photo_url: newData.path,
        },
      }
    ).exec();
    
  }

}
