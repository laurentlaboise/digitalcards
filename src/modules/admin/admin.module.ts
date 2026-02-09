import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Profile, Order, Subscription, AnalyticsEvent } from '../../entities';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Order, Subscription, AnalyticsEvent]),
    ConfigModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
