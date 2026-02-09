import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Integration, IntegrationType } from '../../../entities';
import { ConnectIntegrationDto } from '../dto/connect-integration.dto';
import { encryptJson, decryptJson } from '../../../common/utils/crypto.util';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepo: Repository<Integration>,
    @InjectQueue('sync')
    private readonly syncQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get('jwt.secret');
  }

  listAvailable() {
    return [
      {
        type: IntegrationType.ZAPIER,
        name: 'Zapier',
        description: 'Connect to 5000+ apps with automated workflows',
        category: 'automation',
      },
      {
        type: IntegrationType.SALESFORCE,
        name: 'Salesforce',
        description: 'Sync leads and contacts with Salesforce CRM',
        category: 'crm',
      },
      {
        type: IntegrationType.HUBSPOT,
        name: 'HubSpot',
        description: 'Push leads to HubSpot CRM automatically',
        category: 'crm',
      },
      {
        type: IntegrationType.GOOGLE_WORKSPACE,
        name: 'Google Workspace',
        description: 'Sync team directory from Google Workspace',
        category: 'directory',
      },
      {
        type: IntegrationType.MICROSOFT_365,
        name: 'Microsoft 365',
        description: 'Sync team directory from Microsoft 365',
        category: 'directory',
      },
    ];
  }

  async connect(userId: string, dto: ConnectIntegrationDto) {
    const encrypted = encryptJson(dto.credentials, this.encryptionKey);

    const integration = this.integrationRepo.create({
      user_id: userId,
      organization_id: dto.organization_id || null,
      integration_type: dto.integration_type,
      credentials: { encrypted } as any,
      webhook_url: dto.webhook_url,
      sync_enabled: true,
    });

    await this.integrationRepo.save(integration);
    this.logger.log(`Integration ${dto.integration_type} connected for user ${userId}`);

    return {
      id: integration.id,
      integration_type: integration.integration_type,
      sync_enabled: integration.sync_enabled,
      created_at: integration.created_at,
    };
  }

  async disconnect(integrationId: string) {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    await this.integrationRepo.remove(integration);
    this.logger.log(`Integration ${integrationId} disconnected`);
    return { message: 'Integration disconnected' };
  }

  async triggerSync(integrationId: string) {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    const jobName =
      integration.integration_type === IntegrationType.GOOGLE_WORKSPACE ||
      integration.integration_type === IntegrationType.MICROSOFT_365
        ? 'directory-sync'
        : 'crm-sync';

    await this.syncQueue.add(jobName, {
      integrationId: integration.id,
      organizationId: integration.organization_id,
      type: integration.integration_type,
    });

    this.logger.log(`Sync triggered for integration ${integrationId}`);
    return { message: 'Sync triggered', job: jobName };
  }

  async handleWebhook(integrationId: string, payload: Record<string, any>) {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    await this.syncQueue.add('webhook-delivery', {
      integrationId: integration.id,
      payload,
      attempt: 1,
    });

    return { message: 'Webhook received' };
  }

  getZapierTriggers() {
    return [
      {
        key: 'new_lead',
        name: 'New Lead Captured',
        description: 'Triggers when a new lead is submitted through a profile form',
        fields: ['email', 'name', 'phone', 'company', 'message', 'profile_name'],
      },
      {
        key: 'profile_viewed',
        name: 'Profile Viewed',
        description: 'Triggers when a profile is viewed',
        fields: ['profile_id', 'profile_name', 'viewer_location', 'device', 'timestamp'],
      },
      {
        key: 'nfc_tapped',
        name: 'NFC Card Tapped',
        description: 'Triggers when an NFC card is tapped',
        fields: ['device_serial', 'profile_id', 'profile_name', 'location', 'timestamp'],
      },
    ];
  }

  getZapierActions() {
    return [
      {
        key: 'create_profile',
        name: 'Create Profile',
        description: 'Creates a new digital business card profile',
        fields: ['name', 'email', 'title', 'company', 'phone', 'website', 'bio'],
      },
      {
        key: 'update_profile',
        name: 'Update Profile',
        description: 'Updates an existing profile',
        fields: ['profile_id', 'name', 'email', 'title', 'company', 'phone'],
      },
      {
        key: 'send_followup',
        name: 'Send Follow-up',
        description: 'Sends a follow-up email to a lead',
        fields: ['lead_id', 'template_id', 'message'],
      },
    ];
  }
}
