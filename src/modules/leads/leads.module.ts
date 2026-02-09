import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LeadForm, LeadSubmission, Profile, EmailTemplate } from '../../entities';
import { LeadsService } from './services/leads.service';
import { LeadsController } from './controllers/leads.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadForm, LeadSubmission, Profile, EmailTemplate]),
    ConfigModule,
    BullModule.registerQueue({ name: 'email' }, { name: 'processing' }),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
