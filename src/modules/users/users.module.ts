import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User, Profile, Subscription, MediaAsset } from '../../entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Profile, Subscription, MediaAsset]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
