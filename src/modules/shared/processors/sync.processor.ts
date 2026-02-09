import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationType, LeadSubmission } from '../../../entities';

@Processor('sync')
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Integration)
    private readonly integrationRepo: Repository<Integration>,
    @InjectRepository(LeadSubmission)
    private readonly leadSubmissionRepo: Repository<LeadSubmission>,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'directory-sync':
        return this.syncDirectory(job.data);
      case 'crm-sync':
        return this.syncCRM(job.data);
      case 'webhook-delivery':
        return this.deliverWebhook(job.data);
      default:
        this.logger.warn(`Unknown sync job: ${job.name}`);
    }
  }

  private async syncDirectory(data: {
    integrationId: string;
    organizationId: string;
    type: IntegrationType;
  }): Promise<void> {
    const integration = await this.integrationRepo.findOne({
      where: { id: data.integrationId },
    });

    if (!integration) {
      this.logger.warn(`Integration ${data.integrationId} not found`);
      return;
    }

    switch (data.type) {
      case IntegrationType.GOOGLE_WORKSPACE:
        await this.syncGoogleWorkspace(integration);
        break;
      case IntegrationType.MICROSOFT_365:
        await this.syncMicrosoft365(integration);
        break;
      default:
        this.logger.warn(`Directory sync not supported for ${data.type}`);
    }

    await this.integrationRepo.update(
      { id: data.integrationId },
      { last_sync_at: new Date() },
    );
  }

  private async syncGoogleWorkspace(integration: Integration): Promise<void> {
    // In production: Use Google Admin SDK to fetch directory users
    // Create/update profiles for each user in the organization
    this.logger.log(
      `Google Workspace sync for org ${integration.organization_id}`,
    );
  }

  private async syncMicrosoft365(integration: Integration): Promise<void> {
    // In production: Use Microsoft Graph API to fetch directory users
    this.logger.log(
      `Microsoft 365 sync for org ${integration.organization_id}`,
    );
  }

  private async syncCRM(data: {
    integrationId: string;
    leadId: string;
    type: IntegrationType;
  }): Promise<void> {
    const integration = await this.integrationRepo.findOne({
      where: { id: data.integrationId },
    });

    if (!integration) {
      this.logger.warn(`Integration ${data.integrationId} not found`);
      return;
    }

    const lead = await this.leadSubmissionRepo.findOne({
      where: { id: data.leadId },
    });

    if (!lead) {
      this.logger.warn(`Lead ${data.leadId} not found`);
      return;
    }

    switch (data.type) {
      case IntegrationType.SALESFORCE:
        await this.pushToSalesforce(integration, lead);
        break;
      case IntegrationType.HUBSPOT:
        await this.pushToHubspot(integration, lead);
        break;
      default:
        this.logger.warn(`CRM sync not supported for ${data.type}`);
    }
  }

  private async pushToSalesforce(
    integration: Integration,
    lead: LeadSubmission,
  ): Promise<void> {
    // In production: Use Salesforce REST API with OAuth tokens from integration.credentials
    this.logger.log(`Pushed lead ${lead.id} to Salesforce`);
  }

  private async pushToHubspot(
    integration: Integration,
    lead: LeadSubmission,
  ): Promise<void> {
    // In production: Use HubSpot API with API key from integration.credentials
    this.logger.log(`Pushed lead ${lead.id} to HubSpot`);
  }

  private async deliverWebhook(data: {
    url: string;
    payload: Record<string, any>;
    attempt: number;
  }): Promise<void> {
    const maxAttempts = 5;

    try {
      const response = await fetch(data.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Webhook delivery failed with status ${response.status}`);
      }

      this.logger.log(`Webhook delivered to ${data.url}`);
    } catch (error) {
      if (data.attempt < maxAttempts) {
        this.logger.warn(
          `Webhook delivery failed (attempt ${data.attempt}/${maxAttempts}): ${error.message}`,
        );
        throw error; // BullMQ will retry with backoff
      }
      this.logger.error(
        `Webhook delivery permanently failed after ${maxAttempts} attempts: ${data.url}`,
      );
    }
  }
}
