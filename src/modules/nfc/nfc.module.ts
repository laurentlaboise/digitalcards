import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NFCDevice, Profile } from '../../entities';
import { NfcService } from './services/nfc.service';
import { NfcController } from './controllers/nfc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NFCDevice, Profile]),
    BullModule.registerQueue({ name: 'analytics' }),
  ],
  controllers: [NfcController],
  providers: [NfcService],
  exports: [NfcService],
})
export class NfcModule {}
