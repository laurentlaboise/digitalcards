import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import * as QRCodeLib from 'qrcode';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { Profile, ShortLink, QRCode, QRFormat } from '../../../entities';
import { CreateQrDto } from '../dto/create-qr.dto';

const SHORT_CODE_LENGTH = 7;
const BCRYPT_SALT_ROUNDS = 12;
const SHORT_LINK_CACHE_TTL = 86400; // 24 hours
const QR_CACHE_TTL = 3600; // 1 hour

@Injectable()
export class SharingService {
  private readonly redis: Redis;
  private readonly logger = new Logger(SharingService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    @InjectRepository(QRCode)
    private readonly qrCodeRepository: Repository<QRCode>,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('sms') private readonly smsQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {
    this.redis = new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      password: configService.get('redis.password'),
    });
  }

  async generateQRCode(
    profileId: string,
    style?: CreateQrDto,
  ): Promise<{ qr_data: string; file_url: string }> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const shortLink = await this.getOrCreateShortLink(profileId);
    const shortLinkBase = this.configService.get<string>('urls.shortLinkBase');
    const targetUrl = `${shortLinkBase}/${shortLink.short_code}`;

    const cacheKey = `qr:${profileId}:${JSON.stringify(style || {})}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const qrOptions: QRCodeLib.QRCodeToDataURLOptions = {
      type: 'image/png',
      width: style?.size || 300,
      margin: 2,
      color: {
        dark: style?.color || '#000000',
        light: style?.background || '#FFFFFF',
      },
      errorCorrectionLevel: style?.logo_url ? 'H' : 'M',
    };

    const qrDataUrl = await QRCodeLib.toDataURL(targetUrl, qrOptions);

    const styleSettings = style
      ? {
          color: style.color,
          background: style.background,
          logo_url: style.logo_url,
          shape: style.shape,
          size: style.size,
        }
      : null;

    const qrRecord = this.qrCodeRepository.create({
      profile_id: profileId,
      qr_data: targetUrl,
      style_settings: styleSettings,
      format: QRFormat.PNG,
      file_url: qrDataUrl,
    });

    const savedQr = await this.qrCodeRepository.save(qrRecord);

    const result = {
      qr_data: savedQr.qr_data,
      file_url: savedQr.file_url,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', QR_CACHE_TTL);

    this.logger.log(`QR code generated for profile: ${profileId}`);

    return result;
  }

  async getShortLink(profileId: string): Promise<ShortLink> {
    return this.getOrCreateShortLink(profileId);
  }

  async createVanityUrl(
    profileId: string,
    slug: string,
  ): Promise<ShortLink> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const existing = await this.shortLinkRepository.findOne({
      where: { vanity_slug: slug },
    });

    if (existing) {
      throw new ConflictException(
        `The vanity URL "${slug}" is already taken. Please choose a different one.`,
      );
    }

    let shortLink = await this.shortLinkRepository.findOne({
      where: { profile_id: profileId },
    });

    const appUrl = this.configService.get<string>('urls.app');

    if (shortLink) {
      shortLink.vanity_slug = slug;
      shortLink.full_url = `${appUrl}/p/${profileId}`;
      shortLink = await this.shortLinkRepository.save(shortLink);
    } else {
      const shortCode = randomBytes(5)
        .toString('base64url')
        .substring(0, SHORT_CODE_LENGTH);

      shortLink = this.shortLinkRepository.create({
        profile_id: profileId,
        short_code: shortCode,
        vanity_slug: slug,
        full_url: `${appUrl}/p/${profileId}`,
      });
      shortLink = await this.shortLinkRepository.save(shortLink);
    }

    await this.redis.set(
      `shortlink:vanity:${slug}`,
      JSON.stringify(shortLink),
      'EX',
      SHORT_LINK_CACHE_TTL,
    );

    this.logger.log(
      `Vanity URL created: ${slug} for profile: ${profileId}`,
    );

    return shortLink;
  }

  async resolveShortLink(
    shortCode: string,
  ): Promise<{ profileId: string; fullUrl: string }> {
    const cacheKey = `shortlink:code:${shortCode}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return { profileId: parsed.profile_id, fullUrl: parsed.full_url };
    }

    let shortLink = await this.shortLinkRepository.findOne({
      where: { short_code: shortCode },
    });

    if (!shortLink) {
      shortLink = await this.shortLinkRepository.findOne({
        where: { vanity_slug: shortCode },
      });
    }

    if (!shortLink) {
      throw new NotFoundException('Short link not found');
    }

    await this.redis.set(
      cacheKey,
      JSON.stringify(shortLink),
      'EX',
      SHORT_LINK_CACHE_TTL,
    );

    return {
      profileId: shortLink.profile_id,
      fullUrl: shortLink.full_url,
    };
  }

  async shareViaEmail(
    profileId: string,
    recipientEmail: string,
    message?: string,
  ): Promise<{ queued: boolean }> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const shortLink = await this.getOrCreateShortLink(profileId);
    const shortLinkBase = this.configService.get<string>('urls.shortLinkBase');
    const shareUrl = `${shortLinkBase}/${shortLink.short_code}`;

    await this.emailQueue.add('share-profile', {
      to: recipientEmail,
      profileName: profile.name,
      profileTitle: profile.title,
      profileCompany: profile.company,
      shareUrl,
      personalMessage: message,
    });

    this.logger.log(
      `Email share queued for profile: ${profileId} to: ${recipientEmail}`,
    );

    return { queued: true };
  }

  async shareViaSms(
    profileId: string,
    phoneNumber: string,
    message?: string,
  ): Promise<{ queued: boolean }> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const shortLink = await this.getOrCreateShortLink(profileId);
    const shortLinkBase = this.configService.get<string>('urls.shortLinkBase');
    const shareUrl = `${shortLinkBase}/${shortLink.short_code}`;

    await this.smsQueue.add('share-profile', {
      to: phoneNumber,
      profileName: profile.name,
      shareUrl,
      personalMessage: message,
    });

    this.logger.log(
      `SMS share queued for profile: ${profileId} to: ${phoneNumber}`,
    );

    return { queued: true };
  }

  async setPasswordProtection(
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

    await this.redis.del(`profile:public:${profileId}`);

    this.logger.log(`Password protection updated for profile: ${profileId}`);
  }

  async verifyPassword(
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

  async trackClick(
    shortCode: string,
    metadata: {
      ip_address?: string;
      user_agent?: string;
      referrer?: string;
    },
  ): Promise<void> {
    let shortLink = await this.shortLinkRepository.findOne({
      where: { short_code: shortCode },
    });

    if (!shortLink) {
      shortLink = await this.shortLinkRepository.findOne({
        where: { vanity_slug: shortCode },
      });
    }

    if (!shortLink) {
      return;
    }

    await this.shortLinkRepository.increment(
      { id: shortLink.id },
      'click_count',
      1,
    );

    await this.analyticsQueue.add('track-event', {
      profile_id: shortLink.profile_id,
      event_type: 'click',
      event_metadata: {
        link_clicked: shortCode,
        referrer: metadata.referrer,
      },
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent,
      timestamp: new Date().toISOString(),
    });
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

    if (
      profile.expiration_date &&
      new Date(profile.expiration_date) < new Date()
    ) {
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
      3600,
    );

    return publicProfile;
  }

  private async getOrCreateShortLink(profileId: string): Promise<ShortLink> {
    const existing = await this.shortLinkRepository.findOne({
      where: { profile_id: profileId },
    });

    if (existing) {
      return existing;
    }

    const appUrl = this.configService.get<string>('urls.app');
    let shortCode: string;
    let isUnique = false;

    while (!isUnique) {
      shortCode = randomBytes(5)
        .toString('base64url')
        .substring(0, SHORT_CODE_LENGTH);
      const conflict = await this.shortLinkRepository.findOne({
        where: { short_code: shortCode },
      });
      if (!conflict) {
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
}
