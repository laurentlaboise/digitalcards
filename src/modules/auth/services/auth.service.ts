import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { User, SubscriptionTier } from '../../../entities';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  subscription_tier: SubscriptionTier;
}

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private readonly redis: Redis;
  private readonly SALT_ROUNDS = 12;
  private readonly REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
  private readonly PASSWORD_RESET_TTL = 60 * 60; // 1 hour in seconds

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password'),
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async register(
    email: string,
    password: string,
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    const emailVerificationToken = uuidv4();

    const user = this.userRepository.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      email_verification_token: emailVerificationToken,
      subscription_tier: SubscriptionTier.FREE,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User registered: ${savedUser.id}`);

    const tokens = await this.generateTokens(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        subscription_tier: savedUser.subscription_tier,
        created_at: savedUser.created_at,
      },
      ...tokens,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.is_suspended) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    }

    if (!user.password_hash) {
      throw new UnauthorizedException(
        'This account does not use password authentication',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepository.update(user.id, {
      last_login_at: new Date(),
    });

    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier,
        email_verified_at: user.email_verified_at,
        last_login_at: new Date(),
      },
      ...tokens,
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const storedUserId = await this.redis.get(
      `refresh_token:${refreshToken}`,
    );

    if (!storedUserId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: storedUserId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.is_suspended) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    // Remove the old refresh token
    await this.redis.del(`refresh_token:${refreshToken}`);

    // Generate new token pair
    const tokens = await this.generateTokens(user);

    this.logger.log(`Token refreshed for user: ${user.id}`);

    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const storedUserId = await this.redis.get(
      `refresh_token:${refreshToken}`,
    );

    if (storedUserId && storedUserId === userId) {
      await this.redis.del(`refresh_token:${refreshToken}`);
    }

    this.logger.log(`User logged out: ${userId}`);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.email_verified_at) {
      throw new BadRequestException('Email is already verified');
    }

    await this.userRepository.update(user.id, {
      email_verified_at: new Date(),
      email_verification_token: null,
    });

    this.logger.log(`Email verified for user: ${user.id}`);

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent',
      };
    }

    const resetToken = uuidv4();
    const resetExpiry = new Date(
      Date.now() + this.PASSWORD_RESET_TTL * 1000,
    );

    await this.userRepository.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires_at: resetExpiry,
    });

    // Store in Redis for fast lookup
    await this.redis.set(
      `password_reset:${resetToken}`,
      user.id,
      'EX',
      this.PASSWORD_RESET_TTL,
    );

    this.logger.log(`Password reset requested for user: ${user.id}`);

    return {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const userId = await this.redis.get(`password_reset:${token}`);

    if (!userId) {
      // Fall back to database check
      const user = await this.userRepository.findOne({
        where: { password_reset_token: token },
      });

      if (
        !user ||
        !user.password_reset_expires_at ||
        user.password_reset_expires_at < new Date()
      ) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      await this.userRepository.update(user.id, {
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
      });

      this.logger.log(`Password reset completed for user: ${user.id}`);

      return { message: 'Password has been reset successfully' };
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.userRepository.update(user.id, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires_at: null,
    });

    // Clean up Redis
    await this.redis.del(`password_reset:${token}`);

    // Invalidate all existing refresh tokens for this user
    const keys = await this.redis.keys(`refresh_token:*`);
    for (const key of keys) {
      const storedUserId = await this.redis.get(key);
      if (storedUserId === user.id) {
        await this.redis.del(key);
      }
    }

    this.logger.log(`Password reset completed for user: ${user.id}`);

    return { message: 'Password has been reset successfully' };
  }

  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = uuidv4();

    // Store refresh token in Redis with user ID
    await this.redis.set(
      `refresh_token:${refreshToken}`,
      user.id,
      'EX',
      this.REFRESH_TOKEN_TTL,
    );

    return { accessToken, refreshToken };
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
