import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Profile,
  Subscription,
  SubscriptionTier,
  MediaAsset,
} from '../../../entities';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly s3Client: S3Client;
  private readonly s3Bucket: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('aws.region', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>(
          'aws.secretAccessKey',
          '',
        ),
      },
    });
    this.s3Bucket = this.configService.get<string>(
      'aws.s3Bucket',
      'digitalcards-assets',
    );
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscriptions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {
      password_hash,
      password_reset_token,
      password_reset_expires_at,
      email_verification_token,
      passkey_public_key,
      passkey_credential_id,
      ...safeUser
    } = user;

    return safeUser;
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      user.email = dto.email.toLowerCase();
    }

    // name is not directly on User entity, so we handle it through a profile or ignore gracefully
    // For this service, we update email on the user entity
    const updatedUser = await this.userRepository.save(user);

    const {
      password_hash,
      password_reset_token,
      password_reset_expires_at,
      email_verification_token,
      passkey_public_key,
      passkey_credential_id,
      ...safeUser
    } = updatedUser;

    this.logger.log(`User profile updated: ${userId}`);

    return safeUser;
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark all profiles as inactive
    await this.profileRepository.update(
      { user_id: userId },
      { is_active: false },
    );

    // Soft-delete user by suspending the account
    await this.userRepository.update(userId, {
      is_suspended: true,
      email: `deleted_${Date.now()}_${user.email}`,
    });

    this.logger.log(`User account deleted (soft): ${userId}`);

    return { message: 'Account has been deactivated successfully' };
  }

  async getSubscription(userId: string): Promise<{
    tier: SubscriptionTier;
    subscription: Subscription | null;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: 'active' as any,
      },
      order: { created_at: 'DESC' },
    });

    return {
      tier: user.subscription_tier,
      subscription,
    };
  }

  async getUsage(userId: string): Promise<{
    profiles: { used: number; limit: number };
    storage: { used_bytes: number; limit_bytes: number };
    analytics_retention_days: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileCount = await this.profileRepository.count({
      where: { user_id: userId, is_active: true },
    });

    // Calculate storage used from media assets across user's profiles
    const profiles = await this.profileRepository.find({
      where: { user_id: userId },
      select: ['id'],
    });

    const profileIds = profiles.map((p) => p.id);
    let storageUsedBytes = 0;

    if (profileIds.length > 0) {
      const result = await this.mediaAssetRepository
        .createQueryBuilder('asset')
        .select('COALESCE(SUM(asset.file_size), 0)', 'total')
        .where('asset.profile_id IN (:...profileIds)', { profileIds })
        .getRawOne();
      storageUsedBytes = parseInt(result?.total || '0', 10);
    }

    // Determine limits based on subscription tier
    const tierLimits: Record<
      SubscriptionTier,
      { profiles: number; storage_gb: number; analytics_retention_days: number }
    > = {
      [SubscriptionTier.FREE]: {
        profiles: 1,
        storage_gb: 0.1,
        analytics_retention_days: 7,
      },
      [SubscriptionTier.PRO]: {
        profiles: 10,
        storage_gb: 5,
        analytics_retention_days: 365,
      },
      [SubscriptionTier.ENTERPRISE]: {
        profiles: 100,
        storage_gb: 50,
        analytics_retention_days: 730,
      },
    };

    const limits = tierLimits[user.subscription_tier];

    return {
      profiles: {
        used: profileCount,
        limit: limits.profiles,
      },
      storage: {
        used_bytes: storageUsedBytes,
        limit_bytes: Math.round(limits.storage_gb * 1024 * 1024 * 1024),
      },
      analytics_retention_days: limits.analytics_retention_days,
    };
  }

  async uploadAvatar(
    userId: string,
    file: { mimetype: string; originalname: string },
  ): Promise<{ uploadUrl: string; avatarUrl: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const key = `avatars/${userId}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ContentType: file.mimetype,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    const avatarUrl = `https://${this.s3Bucket}.s3.amazonaws.com/${key}`;

    this.logger.log(`Avatar upload URL generated for user: ${userId}`);

    return { uploadUrl, avatarUrl };
  }
}
