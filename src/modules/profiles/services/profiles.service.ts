import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import {
  Profile,
  SocialLink,
  ShortLink,
  User,
  SubscriptionTier,
} from '../../../entities';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CreateSocialLinkDto } from '../dto/create-social-link.dto';
import { UpdateThemeDto } from '../dto/update-theme.dto';

const FREE_TIER_MAX_PROFILES = 3;
const BCRYPT_SALT_ROUNDS = 12;
const PROFILE_CACHE_TTL = 3600; // 1 hour in seconds
const SHORT_CODE_LENGTH = 7;

@Injectable()
export class ProfilesService {
  private readonly redis: Redis;
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(SocialLink)
    private readonly socialLinkRepository: Repository<SocialLink>,
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      password: configService.get('redis.password'),
    });
  }

  async create(
    userId: string,
    dto: CreateProfileDto,
    orgId?: string,
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.subscription_tier === SubscriptionTier.FREE) {
      const profileCount = await this.profileRepository.count({
        where: { user_id: userId },
      });
      if (profileCount >= FREE_TIER_MAX_PROFILES) {
        throw new ForbiddenException(
          `Free tier is limited to ${FREE_TIER_MAX_PROFILES} profiles. Upgrade to create more.`,
        );
      }
    }

    const organizationId = orgId || dto.organization_id || null;

    const profile = this.profileRepository.create({
      user_id: userId,
      organization_id: organizationId,
      name: dto.name,
      title: dto.title,
      company: dto.company,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      bio: dto.bio,
      theme_settings: dto.theme_settings,
      custom_fields: dto.custom_fields,
      is_active: true,
    });

    const savedProfile = await this.profileRepository.save(profile);

    await this.createShortLink(savedProfile.id);

    this.logger.log(`Profile created: ${savedProfile.id} for user: ${userId}`);

    return this.findOne(savedProfile.id);
  }

  async findAll(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      orgId?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.social_links', 'social_links')
      .leftJoinAndSelect('profile.short_links', 'short_links')
      .where('profile.user_id = :userId', { userId });

    if (query.orgId) {
      qb.andWhere('profile.organization_id = :orgId', { orgId: query.orgId });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('profile.is_active = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(profile.name ILIKE :search OR profile.title ILIKE :search OR profile.company ILIKE :search OR profile.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('profile.created_at', 'DESC')
      .addOrderBy('social_links.display_order', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(profileId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['social_links', 'media_assets', 'short_links'],
      order: {
        social_links: { display_order: 'ASC' },
        media_assets: { display_order: 'ASC' },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(
    profileId: string,
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId, user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found or access denied');
    }

    Object.assign(profile, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.company !== undefined && { company: dto.company }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.website !== undefined && { website: dto.website }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.theme_settings !== undefined && {
        theme_settings: dto.theme_settings,
      }),
      ...(dto.custom_fields !== undefined && {
        custom_fields: dto.custom_fields,
      }),
      ...(dto.organization_id !== undefined && {
        organization_id: dto.organization_id,
      }),
    });

    const updated = await this.profileRepository.save(profile);

    await this.invalidateProfileCache(profileId);

    this.logger.log(`Profile updated: ${profileId}`);

    return this.findOne(updated.id);
  }

  async softDelete(profileId: string, userId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId, user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found or access denied');
    }

    profile.is_active = false;
    await this.profileRepository.save(profile);

    await this.invalidateProfileCache(profileId);

    this.logger.log(`Profile soft-deleted: ${profileId}`);
  }

  async duplicate(profileId: string, userId: string): Promise<Profile> {
    const original = await this.profileRepository.findOne({
      where: { id: profileId, user_id: userId },
      relations: ['social_links'],
    });

    if (!original) {
      throw new NotFoundException('Profile not found or access denied');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.subscription_tier === SubscriptionTier.FREE) {
      const profileCount = await this.profileRepository.count({
        where: { user_id: userId },
      });
      if (profileCount >= FREE_TIER_MAX_PROFILES) {
        throw new ForbiddenException(
          `Free tier is limited to ${FREE_TIER_MAX_PROFILES} profiles. Upgrade to create more.`,
        );
      }
    }

    const duplicated = this.profileRepository.create({
      user_id: userId,
      organization_id: original.organization_id,
      name: `${original.name} (Copy)`,
      title: original.title,
      company: original.company,
      phone: original.phone,
      email: original.email,
      website: original.website,
      bio: original.bio,
      theme_settings: original.theme_settings
        ? { ...original.theme_settings }
        : null,
      custom_fields: original.custom_fields
        ? [...original.custom_fields]
        : null,
      is_active: true,
    });

    const savedProfile = await this.profileRepository.save(duplicated);

    if (original.social_links && original.social_links.length > 0) {
      const clonedLinks = original.social_links.map((link) =>
        this.socialLinkRepository.create({
          profile_id: savedProfile.id,
          platform: link.platform,
          url: link.url,
          label: link.label,
          display_order: link.display_order,
        }),
      );
      await this.socialLinkRepository.save(clonedLinks);
    }

    await this.createShortLink(savedProfile.id);

    this.logger.log(
      `Profile duplicated: ${profileId} -> ${savedProfile.id}`,
    );

    return this.findOne(savedProfile.id);
  }

  async updateTheme(profileId: string, dto: UpdateThemeDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.theme_settings = {
      ...(profile.theme_settings || {}),
      ...(dto.colors !== undefined && { colors: dto.colors }),
      ...(dto.background !== undefined && { background: dto.background }),
      ...(dto.font !== undefined && { font: dto.font }),
      ...(dto.layout !== undefined && { layout: dto.layout }),
    };

    await this.profileRepository.save(profile);

    await this.invalidateProfileCache(profileId);

    return this.findOne(profileId);
  }

  async addSocialLink(
    profileId: string,
    dto: CreateSocialLinkDto,
  ): Promise<SocialLink> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    let displayOrder = dto.display_order;
    if (displayOrder === undefined) {
      const maxOrder = await this.socialLinkRepository
        .createQueryBuilder('link')
        .select('MAX(link.display_order)', 'max')
        .where('link.profile_id = :profileId', { profileId })
        .getRawOne();
      displayOrder = (maxOrder?.max ?? -1) + 1;
    }

    const socialLink = this.socialLinkRepository.create({
      profile_id: profileId,
      platform: dto.platform,
      url: dto.url,
      label: dto.label,
      display_order: displayOrder,
    });

    const savedLink = await this.socialLinkRepository.save(socialLink);

    await this.invalidateProfileCache(profileId);

    return savedLink;
  }

  async updateSocialLink(
    linkId: string,
    dto: Partial<CreateSocialLinkDto>,
  ): Promise<SocialLink> {
    const link = await this.socialLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Social link not found');
    }

    Object.assign(link, {
      ...(dto.platform !== undefined && { platform: dto.platform }),
      ...(dto.url !== undefined && { url: dto.url }),
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.display_order !== undefined && {
        display_order: dto.display_order,
      }),
    });

    const updated = await this.socialLinkRepository.save(link);

    await this.invalidateProfileCache(link.profile_id);

    return updated;
  }

  async removeSocialLink(linkId: string): Promise<void> {
    const link = await this.socialLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Social link not found');
    }

    const profileId = link.profile_id;

    await this.socialLinkRepository.remove(link);

    await this.invalidateProfileCache(profileId);
  }

  async reorderLinks(profileId: string, orderedIds: string[]): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const existingLinks = await this.socialLinkRepository.find({
      where: { profile_id: profileId },
    });

    const existingIdSet = new Set(existingLinks.map((l) => l.id));
    for (const id of orderedIds) {
      if (!existingIdSet.has(id)) {
        throw new BadRequestException(
          `Social link ${id} does not belong to this profile`,
        );
      }
    }

    const updates = orderedIds.map((id, index) =>
      this.socialLinkRepository.update(id, { display_order: index }),
    );

    await Promise.all(updates);

    await this.invalidateProfileCache(profileId);
  }

  async getPublicProfile(
    profileId: string,
  ): Promise<Partial<Profile>> {
    const cacheKey = `profile:public:${profileId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['social_links', 'media_assets'],
      order: {
        social_links: { display_order: 'ASC' },
        media_assets: { display_order: 'ASC' },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.is_active) {
      throw new NotFoundException('This profile is no longer active');
    }

    if (profile.expiration_date && new Date(profile.expiration_date) < new Date()) {
      throw new NotFoundException('This profile has expired');
    }

    const publicProfile = {
      id: profile.id,
      name: profile.name,
      title: profile.title,
      company: profile.company,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      bio: profile.bio,
      profile_photo_url: profile.profile_photo_url,
      company_logo_url: profile.company_logo_url,
      theme_settings: profile.theme_settings,
      custom_fields: profile.custom_fields,
      social_links: profile.social_links,
      media_assets: profile.media_assets,
      password_protected: profile.password_protected,
    };

    await this.redis.set(
      cacheKey,
      JSON.stringify(publicProfile),
      'EX',
      PROFILE_CACHE_TTL,
    );

    return publicProfile;
  }

  async verifyProfilePassword(
    profileId: string,
    password: string,
  ): Promise<boolean> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      select: ['id', 'password_protected', 'password_hash'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.password_protected || !profile.password_hash) {
      return true;
    }

    return bcrypt.compare(password, profile.password_hash);
  }

  async setProfilePassword(
    profileId: string,
    password: string,
  ): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (password) {
      const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      profile.password_protected = true;
      profile.password_hash = hash;
    } else {
      profile.password_protected = false;
      profile.password_hash = null;
    }

    await this.profileRepository.save(profile);

    await this.invalidateProfileCache(profileId);
  }

  private async createShortLink(profileId: string): Promise<ShortLink> {
    const appUrl = this.configService.get<string>('urls.app');
    let shortCode: string;
    let isUnique = false;

    while (!isUnique) {
      shortCode = randomBytes(5).toString('base64url').substring(0, SHORT_CODE_LENGTH);
      const existing = await this.shortLinkRepository.findOne({
        where: { short_code: shortCode },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const shortLink = this.shortLinkRepository.create({
      profile_id: profileId,
      short_code: shortCode,
      full_url: `${appUrl}/p/${profileId}`,
    });

    return this.shortLinkRepository.save(shortLink);
  }

  private async invalidateProfileCache(profileId: string): Promise<void> {
    const cacheKey = `profile:public:${profileId}`;
    await this.redis.del(cacheKey);
  }
}
