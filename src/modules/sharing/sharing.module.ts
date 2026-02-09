import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { Profile, ShortLink, QRCode } from '../../entities';
import { SharingService } from './services/sharing.service';
import { SharingController } from './controllers/sharing.controller';
import { PublicController } from './controllers/public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, ShortLink, QRCode]),
    ConfigModule,
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'analytics' },
    ),
  ],
  controllers: [SharingController, PublicController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
