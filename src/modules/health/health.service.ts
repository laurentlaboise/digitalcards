import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks?: Record<string, { status: 'ok' | 'error'; latency_ms?: number; error?: string }>;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly redis: Redis;
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async liveness(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  async readiness(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    // Check PostgreSQL
    const dbStart = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = { status: 'ok', latency_ms: Date.now() - dbStart };
    } catch (error) {
      checks.database = { status: 'error', error: error.message, latency_ms: Date.now() - dbStart };
    }

    // Check Redis
    const redisStart = Date.now();
    try {
      await this.redis.ping();
      checks.redis = { status: 'ok', latency_ms: Date.now() - redisStart };
    } catch (error) {
      checks.redis = { status: 'error', error: error.message, latency_ms: Date.now() - redisStart };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'ok');

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };
  }

  async metrics(): Promise<Record<string, any>> {
    const dbPool = this.dataSource.driver as any;
    return {
      uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        connected: this.dataSource.isInitialized,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
