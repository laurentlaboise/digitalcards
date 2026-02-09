import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  Profile,
  Organization,
  OrganizationMember,
  MediaAsset,
} from '../../../entities';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly orgMemberRepository: Repository<OrganizationMember>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });
  }

  async getDirectory(
    orgId: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    profiles: Profile[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.ensureOrganizationExists(orgId);

    const skip = (page - 1) * limit;

    const queryBuilder = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.social_links', 'social_links')
      .where('profile.organization_id = :orgId', { orgId })
      .andWhere('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.template_id IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(profile.name) LIKE LOWER(:search) OR LOWER(profile.title) LIKE LOWER(:search) OR LOWER(profile.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('profile.name', 'ASC').skip(skip).take(limit);

    const [profiles, total] = await queryBuilder.getManyAndCount();

    return { profiles, total, page, limit };
  }

  async createTemplate(
    orgId: string,
    dto: CreateTemplateDto,
  ): Promise<Profile> {
    const organization = await this.ensureOrganizationExists(orgId);

    const template = this.profileRepository.create({
      user_id: organization.owner_user_id,
      organization_id: orgId,
      name: dto.name,
      title: dto.title || null,
      company: dto.company || organization.name,
      theme_settings: dto.theme_settings || null,
      custom_fields: dto.custom_fields || null,
      template_id: 'template',
      is_active: true,
    });

    const savedTemplate = await this.profileRepository.save(template);

    this.logger.log(
      `Created template "${dto.name}" for organization ${orgId}`,
    );

    return savedTemplate;
  }

  async getTemplates(orgId: string): Promise<Profile[]> {
    await this.ensureOrganizationExists(orgId);

    return this.profileRepository.find({
      where: {
        organization_id: orgId,
        template_id: 'template',
      },
      order: { created_at: 'DESC' },
    });
  }

  async updateTemplate(
    templateId: string,
    dto: Partial<CreateTemplateDto>,
  ): Promise<Profile> {
    const template = await this.profileRepository.findOne({
      where: { id: templateId, template_id: 'template' },
    });

    if (!template) {
      throw new NotFoundException(
        `Template with ID ${templateId} not found`,
      );
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.title !== undefined) template.title = dto.title;
    if (dto.company !== undefined) template.company = dto.company;
    if (dto.theme_settings !== undefined)
      template.theme_settings = dto.theme_settings;
    if (dto.custom_fields !== undefined)
      template.custom_fields = dto.custom_fields;

    const savedTemplate = await this.profileRepository.save(template);

    this.logger.log(`Updated template ${templateId}`);

    return savedTemplate;
  }

  async bulkCreateProfiles(
    orgId: string,
    profiles: Array<{
      name: string;
      email: string;
      title: string;
      phone?: string;
    }>,
  ): Promise<{ created: number; profiles: Profile[] }> {
    const organization = await this.ensureOrganizationExists(orgId);

    const createdProfiles: Profile[] = [];

    for (const profileData of profiles) {
      const profile = this.profileRepository.create({
        user_id: organization.owner_user_id,
        organization_id: orgId,
        name: profileData.name,
        email: profileData.email,
        title: profileData.title,
        phone: profileData.phone || null,
        company: organization.name,
        theme_settings: organization.branding_settings
          ? {
              colors: organization.branding_settings.colors
                ? {
                    primary: organization.branding_settings.colors.primary,
                    secondary:
                      organization.branding_settings.colors.secondary,
                    background: '#ffffff',
                  }
                : undefined,
              font: organization.branding_settings.fonts?.body,
            }
          : null,
        company_logo_url: organization.branding_settings?.logo_url || null,
        is_active: true,
      });

      const savedProfile = await this.profileRepository.save(profile);
      createdProfiles.push(savedProfile);
    }

    this.logger.log(
      `Bulk created ${createdProfiles.length} profiles for organization ${orgId}`,
    );

    return {
      created: createdProfiles.length,
      profiles: createdProfiles,
    };
  }

  async getUsage(
    orgId: string,
  ): Promise<{
    profiles_count: number;
    storage_used_bytes: number;
    member_count: number;
    seats: number;
  }> {
    const organization = await this.ensureOrganizationExists(orgId);

    const profilesCount = await this.profileRepository.count({
      where: {
        organization_id: orgId,
        is_active: true,
        template_id: undefined,
      },
    });

    const memberCount = await this.orgMemberRepository.count({
      where: { organization_id: orgId },
    });

    // Calculate storage from media assets of organization profiles
    const storageResult = await this.mediaAssetRepository
      .createQueryBuilder('asset')
      .innerJoin('asset.profile', 'profile')
      .where('profile.organization_id = :orgId', { orgId })
      .select('COALESCE(SUM(asset.file_size), 0)', 'total_bytes')
      .getRawOne();

    const storageUsedBytes = parseInt(storageResult?.total_bytes || '0', 10);

    return {
      profiles_count: profilesCount,
      storage_used_bytes: storageUsedBytes,
      member_count: memberCount,
      seats: organization.seat_count,
    };
  }

  async exportTeamData(
    orgId: string,
    format: string,
  ): Promise<{ jobId: string; status: string }> {
    await this.ensureOrganizationExists(orgId);

    const jobId = `export:${orgId}:${Date.now()}`;

    await this.redis.set(
      `export-job:${jobId}`,
      JSON.stringify({
        orgId,
        format,
        status: 'queued',
        createdAt: new Date().toISOString(),
      }),
      'EX',
      86400, // 24 hour TTL
    );

    // Queue the export job for async processing
    await this.redis.lpush(
      'export-jobs',
      JSON.stringify({ jobId, orgId, format }),
    );

    this.logger.log(
      `Queued export job ${jobId} for organization ${orgId} in ${format} format`,
    );

    return { jobId, status: 'queued' };
  }

  private async ensureOrganizationExists(
    orgId: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with ID ${orgId} not found`,
      );
    }

    return organization;
  }
}
