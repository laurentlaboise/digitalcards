import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';
import { NFCDevice, Profile, EventType } from '../../../entities';
import { ProvisionDeviceDto } from '../dto/provision-device.dto';

@Injectable()
export class NfcService {
  private readonly logger = new Logger(NfcService.name);

  constructor(
    @InjectRepository(NFCDevice)
    private readonly nfcDeviceRepository: Repository<NFCDevice>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) {}

  async provision(dto: ProvisionDeviceDto): Promise<NFCDevice> {
    const deviceSerial = this.generateDeviceSerial();
    const provisioningToken = randomBytes(32).toString('hex');

    const device = this.nfcDeviceRepository.create({
      device_serial: deviceSerial,
      device_type: dto.device_type,
      material: dto.material,
      provisioning_token: provisioningToken,
      order_id: dto.order_id || null,
    });

    const saved = await this.nfcDeviceRepository.save(device);
    this.logger.log(`Provisioned NFC device: ${deviceSerial}`);
    return saved;
  }

  async getDevice(deviceSerial: string): Promise<NFCDevice> {
    const device = await this.nfcDeviceRepository.findOne({
      where: { device_serial: deviceSerial },
      relations: ['profile', 'order'],
    });

    if (!device) {
      throw new NotFoundException(`NFC device with serial ${deviceSerial} not found`);
    }

    return device;
  }

  async linkProfile(
    deviceSerial: string,
    profileId: string,
    userId: string,
  ): Promise<NFCDevice> {
    const device = await this.nfcDeviceRepository.findOne({
      where: { device_serial: deviceSerial },
    });

    if (!device) {
      throw new NotFoundException(`NFC device with serial ${deviceSerial} not found`);
    }

    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }

    if (profile.user_id !== userId) {
      throw new ForbiddenException('You can only link your own profiles to NFC devices');
    }

    if (device.profile_id && device.profile_id !== profileId) {
      throw new ConflictException(
        'Device is already linked to another profile. Unlink it first.',
      );
    }

    device.profile_id = profileId;
    device.activated_at = new Date();

    const saved = await this.nfcDeviceRepository.save(device);
    this.logger.log(`Linked device ${deviceSerial} to profile ${profileId}`);
    return saved;
  }

  async unlinkProfile(deviceSerial: string, userId: string): Promise<NFCDevice> {
    const device = await this.nfcDeviceRepository.findOne({
      where: { device_serial: deviceSerial },
      relations: ['profile'],
    });

    if (!device) {
      throw new NotFoundException(`NFC device with serial ${deviceSerial} not found`);
    }

    if (!device.profile_id) {
      throw new ConflictException('Device is not linked to any profile');
    }

    if (device.profile && device.profile.user_id !== userId) {
      throw new ForbiddenException('You can only unlink devices from your own profiles');
    }

    device.profile_id = null;
    device.activated_at = null;

    const saved = await this.nfcDeviceRepository.save(device);
    this.logger.log(`Unlinked device ${deviceSerial} from profile`);
    return saved;
  }

  async handleScan(
    deviceSerial: string,
    metadata: { user_agent?: string; ip_address?: string },
  ): Promise<{ redirect_url: string | null; profile_id: string | null }> {
    const device = await this.nfcDeviceRepository.findOne({
      where: { device_serial: deviceSerial },
      relations: ['profile'],
    });

    if (!device) {
      throw new NotFoundException(`NFC device with serial ${deviceSerial} not found`);
    }

    if (!device.profile_id || !device.profile) {
      return { redirect_url: null, profile_id: null };
    }

    await this.analyticsQueue.add('ingest-event', {
      profile_id: device.profile_id,
      event_type: EventType.NFC_TAP,
      event_metadata: {
        nfc_serial: deviceSerial,
        device: this.parseDevice(metadata.user_agent),
        os: this.parseOS(metadata.user_agent),
        browser: this.parseBrowser(metadata.user_agent),
      },
      ip_address: metadata.ip_address || null,
      user_agent: metadata.user_agent || null,
      timestamp: new Date().toISOString(),
    });

    const redirectUrl = `/p/${device.profile.id}`;

    this.logger.log(`NFC scan on device ${deviceSerial} -> profile ${device.profile_id}`);

    return {
      redirect_url: redirectUrl,
      profile_id: device.profile_id,
    };
  }

  async getOrderDevices(orderId: string): Promise<NFCDevice[]> {
    return this.nfcDeviceRepository.find({
      where: { order_id: orderId },
      relations: ['profile'],
      order: { created_at: 'ASC' },
    });
  }

  private generateDeviceSerial(): string {
    const prefix = 'NFC';
    const randomPart = randomBytes(6).toString('hex').toUpperCase();
    return `${prefix}-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}-${randomPart.slice(8, 12)}`;
  }

  private parseDevice(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private parseOS(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'unknown';
  }

  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
    if (/edg/i.test(userAgent)) return 'Edge';
    return 'unknown';
  }
}
