import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent, QRCode, NFCDevice, Order, Integration, LeadSubmission } from '../../entities';
import { EmailProcessor } from './processors/email.processor';
import { ProcessingProcessor } from './processors/processing.processor';
import { FulfillmentProcessor } from './processors/fulfillment.processor';
import { SyncProcessor } from './processors/sync.processor';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      QRCode,
      NFCDevice,
      Order,
      Integration,
      LeadSubmission,
    ]),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'processing' },
      { name: 'fulfillment' },
      { name: 'sync' },
    ),
  ],
  providers: [
    EmailProcessor,
    ProcessingProcessor,
    FulfillmentProcessor,
    SyncProcessor,
  ],
  exports: [BullModule],
})
export class SharedModule {}
