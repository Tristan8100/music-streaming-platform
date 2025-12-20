import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, Follow, FollowSchema } from './entities/user.entity';
import { FollowsService } from './follows/follows.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Follow.name, schema: FollowSchema }])], // ADDED
  controllers: [UsersController],
  providers: [UsersService, FollowsService],
  exports: [UsersService], // ADDED when using on other modules
})
export class UsersModule {}
