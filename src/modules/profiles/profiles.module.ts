import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Profile, SocialLink, ShortLink, User } from '../../entities';
import { MediaAsset } from '../../entities';
import { ProfilesService } from './services/profiles.service';
import { ProfilesController } from './controllers/profiles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, SocialLink, MediaAsset, ShortLink, User]),
    ConfigModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
