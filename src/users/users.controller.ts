import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException, } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassword, UpdateProfile, UpdateUserDto } from './dto/update-user.dto';
import { FollowsService } from './follows/follows.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';

import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followsService: FollowsService
  ) {}

  @ApiOperation({ summary: 'Create User' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get User By Id using Params' })
  @Get('user/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Get Currently Authenticated User Data' })
  @UseGuards(AuthGuard, RolesGuard)
  @Get('user-auth') // Get Authenticated User Data
  GetAuthUser(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiOperation({ summary: 'Update User By Id using Params not recommended if not admin' })
  @Patch('user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete User By Id using Params not recommended if not admin' })
  @Delete('user/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }


  //FOLLOWS
  @ApiOperation({ summary: 'Follow User By Id using Params' })
  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Post('follow/:id')
  follow(@Param('id') id: string, @Request() req) {
    return this.followsService.follow(id, req.user);
  }

  @ApiOperation({ summary: 'Unfollow User By Id using Params' })
  @UseGuards(AuthGuard, RolesGuard)
  @Post('unfollow/:id')
  unFollow(@Param('id') id: string, @Request() req) {
    return this.followsService.unFollow(id, req.user);
  }

  @ApiOperation({ summary: 'Get All Currently Authenticated User Followers' })
  @UseGuards(AuthGuard, RolesGuard)
  @Get('followers')
  getAllFollowers(@Request() req) {
    return this.followsService.getAllFollowers(req.user.id);
  }

  @ApiOperation({ summary: 'Get All Currently Authenticated User Following' })
  @UseGuards(AuthGuard, RolesGuard)
  @Get('following')
  getAllFollowing(@Request() req) {
    return this.followsService.getAllFollowing(req.user.id);
  }


  //SETTINGS == NOT YET TESTED
  @ApiOperation({ summary: 'Update Currently Authenticated User Name' })
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update-name')
  updateName(@Request() req, @Body() updateUserDto: UpdateProfile) {
    return this.usersService.updateName(req.user.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update Currently Authenticated User Password' })
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update-password')
  updatePassword(@Request() req, @Body() dto: UpdatePassword) {
    console.log('ETO DTO',dto);
    return this.usersService.updatePassword(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Update Currently Authenticated User Avatar' })
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
