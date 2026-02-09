import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  Profile,
  Organization,
  OrganizationMember,
  MediaAsset,
} from '../../entities';
import { TeamsService } from './services/teams.service';
import { TeamsController } from './controllers/teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Organization,
      OrganizationMember,
      MediaAsset,
    ]),
    ConfigModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
