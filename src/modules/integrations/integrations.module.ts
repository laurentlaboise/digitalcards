import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Integration } from '../../entities';
import { IntegrationsService } from './services/integrations.service';
import { IntegrationsController } from './controllers/integrations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration]),
    ConfigModule,
    BullModule.registerQueue({ name: 'sync' }),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
