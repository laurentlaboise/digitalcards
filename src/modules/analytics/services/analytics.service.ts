import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AnalyticsEvent, EventType, Profile } from '../../../entities';
import { CreateEventDto } from '../dto/create-event.dto';
import { AnalyticsInterval } from '../dto/analytics-query.dto';

export interface AnalyticsSummary {
  total_views: number;
  total_clicks: number;
  total_shares: number;
  total_leads: number;
  total_nfc_taps: number;
  changes: {
    views_pct: number;
    clicks_pct: number;
    shares_pct: number;
    leads_pct: number;
    nfc_taps_pct: number;
  };
}

export interface TimeseriesBucket {
  period: string;
  views: number;
  clicks: number;
  shares: number;
  leads: number;
  nfc_taps: number;
}

export interface GeographyEntry {
  country: string;
  count: number;
}

export interface DeviceBreakdown {
  devices: Array<{ device: string; count: number }>;
  operating_systems: Array<{ os: string; count: number }>;
}

export interface ReferrerEntry {
  referrer: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      password: configService.get('redis.password'),
    });
  }

  async ingestEvent(dto: CreateEventDto): Promise<{ queued: boolean }> {
    const profile = await this.profileRepository.findOne({
      where: { id: dto.profile_id },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${dto.profile_id} not found`);
    }

    await this.analyticsQueue.add('ingest-event', {
      profile_id: dto.profile_id,
      event_type: dto.event_type,
      event_metadata: dto.event_metadata || null,
      ip_address: dto.ip_address || null,
      user_agent: dto.user_agent || null,
      timestamp: new Date().toISOString(),
    });

    const realtimePayload = JSON.stringify({
      profile_id: dto.profile_id,
      event_type: dto.event_type,
      event_metadata: dto.event_metadata,
      timestamp: new Date().toISOString(),
    });

    await this.redis.lpush(
      `analytics:realtime:${dto.profile_id}`,
      realtimePayload,
    );
    await this.redis.ltrim(`analytics:realtime:${dto.profile_id}`, 0, 99);
    await this.redis.publish(
      `analytics:live:${dto.profile_id}`,
      realtimePayload,
    );

    return { queued: true };
  }

  async getSummary(
    profileId: string,
    dateRange: { start: string; end: string },
  ): Promise<AnalyticsSummary> {
    await this.ensureProfileExists(profileId);

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    const rangeDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - rangeDuration);
    const previousEnd = new Date(start);

    const currentCounts = await this.getCountsByType(profileId, start, end);
    const previousCounts = await this.getCountsByType(
      profileId,
      previousStart,
      previousEnd,
    );

    return {
      total_views: currentCounts[EventType.VIEW] || 0,
      total_clicks: currentCounts[EventType.CLICK] || 0,
      total_shares: currentCounts[EventType.SHARE] || 0,
      total_leads: currentCounts[EventType.LEAD_CAPTURE] || 0,
      total_nfc_taps: currentCounts[EventType.NFC_TAP] || 0,
      changes: {
        views_pct: this.calculatePercentChange(
          previousCounts[EventType.VIEW] || 0,
          currentCounts[EventType.VIEW] || 0,
        ),
        clicks_pct: this.calculatePercentChange(
          previousCounts[EventType.CLICK] || 0,
          currentCounts[EventType.CLICK] || 0,
        ),
        shares_pct: this.calculatePercentChange(
          previousCounts[EventType.SHARE] || 0,
          currentCounts[EventType.SHARE] || 0,
        ),
        leads_pct: this.calculatePercentChange(
          previousCounts[EventType.LEAD_CAPTURE] || 0,
          currentCounts[EventType.LEAD_CAPTURE] || 0,
        ),
        nfc_taps_pct: this.calculatePercentChange(
          previousCounts[EventType.NFC_TAP] || 0,
          currentCounts[EventType.NFC_TAP] || 0,
        ),
      },
    };
  }

  async getTimeseries(
    profileId: string,
    dateRange: { start: string; end: string },
    interval: AnalyticsInterval = AnalyticsInterval.DAILY,
  ): Promise<TimeseriesBucket[]> {
    await this.ensureProfileExists(profileId);

    const pgInterval = this.toPgDateTrunc(interval);

    const result = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select(`date_trunc('${pgInterval}', event.timestamp)`, 'period')
      .addSelect(
        `COUNT(*) FILTER (WHERE event.event_type = '${EventType.VIEW}')`,
        'views',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE event.event_type = '${EventType.CLICK}')`,
        'clicks',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE event.event_type = '${EventType.SHARE}')`,
        'shares',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE event.event_type = '${EventType.LEAD_CAPTURE}')`,
        'leads',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE event.event_type = '${EventType.NFC_TAP}')`,
        'nfc_taps',
      )
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start: dateRange.start })
      .andWhere('event.timestamp <= :end', { end: dateRange.end })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      period: row.period,
      views: parseInt(row.views, 10),
      clicks: parseInt(row.clicks, 10),
      shares: parseInt(row.shares, 10),
      leads: parseInt(row.leads, 10),
      nfc_taps: parseInt(row.nfc_taps, 10),
    }));
  }

  async getGeography(
    profileId: string,
    dateRange: { start: string; end: string },
  ): Promise<GeographyEntry[]> {
    await this.ensureProfileExists(profileId);

    const result = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select("event.geolocation->>'country'", 'country')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start: dateRange.start })
      .andWhere('event.timestamp <= :end', { end: dateRange.end })
      .andWhere("event.geolocation->>'country' IS NOT NULL")
      .groupBy("event.geolocation->>'country'")
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      country: row.country,
      count: parseInt(row.count, 10),
    }));
  }

  async getDevices(
    profileId: string,
    dateRange: { start: string; end: string },
  ): Promise<DeviceBreakdown> {
    await this.ensureProfileExists(profileId);

    const deviceResult = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select("event.event_metadata->>'device'", 'device')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start: dateRange.start })
      .andWhere('event.timestamp <= :end', { end: dateRange.end })
      .andWhere("event.event_metadata->>'device' IS NOT NULL")
      .groupBy("event.event_metadata->>'device'")
      .orderBy('count', 'DESC')
      .getRawMany();

    const osResult = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select("event.event_metadata->>'os'", 'os')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start: dateRange.start })
      .andWhere('event.timestamp <= :end', { end: dateRange.end })
      .andWhere("event.event_metadata->>'os' IS NOT NULL")
      .groupBy("event.event_metadata->>'os'")
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      devices: deviceResult.map((row) => ({
        device: row.device,
        count: parseInt(row.count, 10),
      })),
      operating_systems: osResult.map((row) => ({
        os: row.os,
        count: parseInt(row.count, 10),
      })),
    };
  }

  async getReferrers(
    profileId: string,
    dateRange: { start: string; end: string },
  ): Promise<ReferrerEntry[]> {
    await this.ensureProfileExists(profileId);

    const result = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select("event.event_metadata->>'referrer'", 'referrer')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start: dateRange.start })
      .andWhere('event.timestamp <= :end', { end: dateRange.end })
      .andWhere("event.event_metadata->>'referrer' IS NOT NULL")
      .groupBy("event.event_metadata->>'referrer'")
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      referrer: row.referrer,
      count: parseInt(row.count, 10),
    }));
  }

  async exportAnalytics(
    profileId: string,
    dateRange: { start: string; end: string },
    format: 'csv' | 'pdf',
  ): Promise<{ job_id: string }> {
    await this.ensureProfileExists(profileId);

    const job = await this.analyticsQueue.add('export-analytics', {
      profile_id: profileId,
      start_date: dateRange.start,
      end_date: dateRange.end,
      format,
    });

    this.logger.log(
      `Queued analytics export job ${job.id} for profile ${profileId} in ${format} format`,
    );

    return { job_id: job.id as string };
  }

  async getRealtimeEvents(profileId: string): Promise<any[]> {
    await this.ensureProfileExists(profileId);

    const rawEvents = await this.redis.lrange(
      `analytics:realtime:${profileId}`,
      0,
      99,
    );

    return rawEvents.map((raw) => JSON.parse(raw));
  }

  private async getCountsByType(
    profileId: string,
    start: Date,
    end: Date,
  ): Promise<Record<string, number>> {
    const result = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select('event.event_type', 'event_type')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId })
      .andWhere('event.timestamp >= :start', { start })
      .andWhere('event.timestamp <= :end', { end })
      .groupBy('event.event_type')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of result) {
      counts[row.event_type] = parseInt(row.count, 10);
    }
    return counts;
  }

  private calculatePercentChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  private toPgDateTrunc(interval: AnalyticsInterval): string {
    switch (interval) {
      case AnalyticsInterval.DAILY:
        return 'day';
      case AnalyticsInterval.WEEKLY:
        return 'week';
      case AnalyticsInterval.MONTHLY:
        return 'month';
      default:
        return 'day';
    }
  }

  private async ensureProfileExists(profileId: string): Promise<void> {
    const exists = await this.profileRepository.findOne({
      where: { id: profileId },
      select: ['id'],
    });
    if (!exists) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }
  }
}
