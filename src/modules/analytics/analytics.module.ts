import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalyticsEvent, Profile } from '../../entities';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsGateway } from './gateways/analytics.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent, Profile]),
    BullModule.registerQueue({ name: 'analytics' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1d'),
        },
      }),
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsGateway],
  exports: [AnalyticsService, AnalyticsGateway],
})
export class AnalyticsModule {}
