import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassword, UpdateProfile, UpdateUserDto } from './dto/update-user.dto';
import { FollowsService } from './follows/follows.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';

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

}
