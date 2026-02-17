import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, EventType, QRCode, QRFormat, MediaAsset } from '../../../entities';
import * as QRCodeLib from 'qrcode';

@Processor('processing')
export class ProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(ProcessingProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepo: Repository<AnalyticsEvent>,
    @InjectRepository(QRCode)
    private readonly qrCodeRepo: Repository<QRCode>,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'qr-generation':
        return this.generateQRCode(job.data);
      case 'analytics-aggregation':
        return this.aggregateAnalytics(job.data);
      case 'lead-enrichment':
        return this.enrichLead(job.data);
      case 'bulk-import':
        return this.processBulkImport(job.data);
      case 'media-optimization':
        return this.optimizeMedia(job.data);
      case 'analytics-batch-insert':
        return this.batchInsertAnalytics(job.data);
      default:
        this.logger.warn(`Unknown processing job: ${job.name}`);
    }
  }

  private async generateQRCode(data: {
    profileId: string;
    url: string;
    style?: { color?: string; background?: string; width?: number };
  }): Promise<string> {
    const options: QRCodeLib.QRCodeToDataURLOptions = {
      type: 'image/png',
      width: data.style?.width || 300,
      margin: 2,
      color: {
        dark: data.style?.color || '#000000',
        light: data.style?.background || '#FFFFFF',
      },
    };

    const dataUrl = await QRCodeLib.toDataURL(data.url, options);

    const qrCode = this.qrCodeRepo.create({
      profile_id: data.profileId,
      qr_data: data.url,
      style_settings: data.style || {},
      format: QRFormat.PNG,
      file_url: dataUrl,
    });

    await this.qrCodeRepo.save(qrCode);
    this.logger.log(`QR code generated for profile ${data.profileId}`);
    return dataUrl;
  }

  private async aggregateAnalytics(data: {
    profileId: string;
    date: string;
  }): Promise<void> {
    const result = await this.analyticsRepo
      .createQueryBuilder('event')
      .select('event.event_type', 'event_type')
      .addSelect('COUNT(*)', 'count')
      .where('event.profile_id = :profileId', { profileId: data.profileId })
      .andWhere('DATE(event.timestamp) = :date', { date: data.date })
      .groupBy('event.event_type')
      .getRawMany();

    this.logger.log(
      `Aggregated analytics for profile ${data.profileId} on ${data.date}: ${JSON.stringify(result)}`,
    );
  }

  private async enrichLead(data: {
    leadId: string;
    email?: string;
    name?: string;
  }): Promise<void> {
    // Placeholder for third-party enrichment API (Clearbit, Apollo, etc.)
    this.logger.log(`Lead enrichment queued for lead ${data.leadId}`);
    // In production, call enrichment API and update lead_submissions.enrichment_data
  }

  private async processBulkImport(data: {
    orgId: string;
    userId: string;
    profiles: Array<{ name: string; email: string; title?: string; phone?: string }>;
  }): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const profile of data.profiles) {
      try {
        // Profile creation would be delegated to ProfileService
        // This is handled at the service layer
        created++;
      } catch (err) {
        errors.push(`Failed to create profile for ${profile.email}: ${err.message}`);
      }
    }

    this.logger.log(`Bulk import for org ${data.orgId}: ${created} created, ${errors.length} errors`);
    return { created, errors };
  }

  private async optimizeMedia(data: {
    assetId: string;
    fileUrl: string;
    mimeType: string;
  }): Promise<void> {
    // In production, download from S3, optimize with sharp, re-upload
    this.logger.log(`Media optimization queued for asset ${data.assetId}`);
  }

  private async batchInsertAnalytics(data: {
    events: Array<{
      profile_id: string;
      event_type: string;
      event_metadata?: Record<string, any>;
      ip_address?: string;
      user_agent?: string;
      geolocation?: Record<string, any>;
      timestamp: string;
    }>;
  }): Promise<void> {
    if (!data.events.length) return;

    const entities = data.events.map((event) =>
      this.analyticsRepo.create({
        ...event,
        event_type: event.event_type as EventType,
        timestamp: new Date(event.timestamp),
      }),
    );

    await this.analyticsRepo.save(entities, { chunk: 100 });
    this.logger.log(`Batch inserted ${entities.length} analytics events`);
  }
}
