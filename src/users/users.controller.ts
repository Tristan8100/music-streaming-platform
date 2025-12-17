import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException, } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassword, UpdateProfile, UpdateUserDto } from './dto/update-user.dto';
import { FollowsService } from './follows/follows.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';

import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followsService: FollowsService
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('user/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }


  //FOLLOWS
  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Post('follow/:id')
  follow(@Param('id') id: string, @Request() req) {
    return this.followsService.follow(id, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('unfollow/:id')
  unFollow(@Param('id') id: string, @Request() req) {
    return this.followsService.unFollow(id, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('followers')
  getAllFollowers(@Request() req) {
    return this.followsService.getAllFollowers(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('following')
  getAllFollowing(@Request() req) {
    return this.followsService.getAllFollowing(req.user.id);
  }


  //SETTINGS == NOT YET TESTED
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update-name')
  updateName(@Request() req, @Body() updateUserDto: UpdateProfile) {
    return this.usersService.updateName(req.user.id, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update-password')
  updatePassword(@Request() req, @Body() dto: UpdatePassword) {
    return this.usersService.updatePassword(req.user.id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      // Accept only images
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(
          new BadRequestException('Only image files are allowed!'),
          false,
        );
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, //5MB max
  }),)
  @Post('upload-avatar')
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const avatarUrl = await this.usersService.updateProfile(req.user.id, file);
    return { avatarUrl };
  }

}
