import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';

// Entities
import {
  User,
  Organization,
  OrganizationMember,
  Profile,
  SocialLink,
  MediaAsset,
  NFCDevice,
  ShortLink,
  QRCode,
  LeadForm,
  LeadSubmission,
  AnalyticsEvent,
  Order,
  Product,
  Subscription,
  EmailTemplate,
  AuditLog,
  Integration,
} from './entities';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { NfcModule } from './modules/nfc/nfc.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LeadsModule } from './modules/leads/leads.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';
import { TeamsModule } from './modules/teams/teams.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AdminModule } from './modules/admin/admin.module';
import { SharedModule } from './modules/shared/shared.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        ssl: config.get('database.ssl') ? { rejectUnauthorized: false } : false,
        entities: [
          User,
          Organization,
          OrganizationMember,
          Profile,
          SocialLink,
          MediaAsset,
          NFCDevice,
          ShortLink,
          QRCode,
          LeadForm,
          LeadSubmission,
          AnalyticsEvent,
          Order,
          Product,
          Subscription,
          EmailTemplate,
          AuditLog,
          Integration,
        ],
        synchronize: config.get('nodeEnv') === 'development',
        logging: config.get('nodeEnv') === 'development' ? ['error', 'warn'] : ['error'],
        extra: {
          max: 100,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        },
      }),
    }),

    // BullMQ Job Queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000,
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProfilesModule,
    SharingModule,
    NfcModule,
    AnalyticsModule,
    LeadsModule,
    EcommerceModule,
    TeamsModule,
    IntegrationsModule,
    AdminModule,

    // Infrastructure
    SharedModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
