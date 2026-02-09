import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  Organization,
  OrganizationMember,
  OrgRole,
  User,
  AuditLog,
  AuditAction,
  AuditResourceType,
} from '../../../entities';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { UpdateBrandingDto } from '../dto/update-branding.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<Organization> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const org = this.orgRepository.create({
      name: dto.name,
      owner_user_id: userId,
      custom_domain: dto.customDomain || null,
      subscription_tier: user.subscription_tier,
      seat_count: 1,
    });

    const savedOrg = await this.orgRepository.save(org);

    // Add the creator as an admin member
    const member = this.memberRepository.create({
      organization_id: savedOrg.id,
      user_id: userId,
      role: OrgRole.ADMIN,
      joined_at: new Date(),
    });

    await this.memberRepository.save(member);

    await this.createAuditLog(
      userId,
      savedOrg.id,
      AuditAction.CREATE,
      AuditResourceType.ORGANIZATION,
      savedOrg.id,
      null,
      { name: savedOrg.name },
    );

    this.logger.log(
      `Organization created: ${savedOrg.id} by user: ${userId}`,
    );

    return savedOrg;
  }

  async findOne(orgId: string): Promise<Organization & { memberCount: number }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const memberCount = await this.memberRepository.count({
      where: { organization_id: orgId },
    });

    return { ...org, memberCount };
  }

  async update(
    orgId: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const before = { name: org.name, custom_domain: org.custom_domain };

    if (dto.name !== undefined) {
      org.name = dto.name;
    }

    if (dto.customDomain !== undefined) {
      org.custom_domain = dto.customDomain;
    }

    const updatedOrg = await this.orgRepository.save(org);

    this.logger.log(`Organization updated: ${orgId}`);

    return updatedOrg;
  }

  async delete(orgId: string): Promise<{ message: string }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.orgRepository.remove(org);

    this.logger.log(`Organization deleted: ${orgId}`);

    return { message: 'Organization deleted successfully' };
  }

  async getMembers(
    orgId: string,
    pagination: { page: number; limit: number },
  ): Promise<{
    members: OrganizationMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    const [members, total] = await this.memberRepository.findAndCount({
      where: { organization_id: orgId },
      relations: ['user'],
      order: { invited_at: 'DESC' },
      skip,
      take: limit,
    });

    // Strip sensitive user data from the response
    const safeMembers = members.map((member) => {
      if (member.user) {
        const {
          password_hash,
          password_reset_token,
          password_reset_expires_at,
          email_verification_token,
          passkey_public_key,
          passkey_credential_id,
          ...safeUser
        } = member.user;
        member.user = safeUser as User;
      }
      return member;
    });

    return {
      members: safeMembers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async inviteMember(
    orgId: string,
    email: string,
    role: OrgRole = OrgRole.VIEWER,
    invitedByUserId: string,
  ): Promise<OrganizationMember> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Check if the user is already a member
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      const existingMembership = await this.memberRepository.findOne({
        where: {
          organization_id: orgId,
          user_id: existingUser.id,
        },
      });

      if (existingMembership) {
        throw new ConflictException(
          'This user is already a member of the organization',
        );
      }
    }

    // Check for existing pending invite
    const existingInvite = await this.memberRepository.findOne({
      where: {
        organization_id: orgId,
        invite_email: email.toLowerCase(),
      },
    });

    if (existingInvite && !existingInvite.joined_at) {
      throw new ConflictException(
        'An invitation has already been sent to this email',
      );
    }

    const inviteToken = uuidv4();

    const member = this.memberRepository.create({
      organization_id: orgId,
      user_id: existingUser?.id || null,
      role,
      invited_by_user_id: invitedByUserId,
      invite_token: inviteToken,
      invite_email: email.toLowerCase(),
    });

    const savedMember = await this.memberRepository.save(member);

    await this.createAuditLog(
      invitedByUserId,
      orgId,
      AuditAction.INVITE,
      AuditResourceType.MEMBER,
      savedMember.id,
      null,
      { email, role },
    );

    this.logger.log(
      `Member invited to org ${orgId}: ${email} as ${role} by user: ${invitedByUserId}`,
    );

    return savedMember;
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    role: OrgRole,
  ): Promise<OrganizationMember> {
    const member = await this.memberRepository.findOne({
      where: {
        organization_id: orgId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Prevent changing the owner's role
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (org && org.owner_user_id === userId && role !== OrgRole.ADMIN) {
      throw new ForbiddenException(
        'Cannot change the role of the organization owner',
      );
    }

    const previousRole = member.role;
    member.role = role;

    const updatedMember = await this.memberRepository.save(member);

    this.logger.log(
      `Member role updated in org ${orgId}: user ${userId} from ${previousRole} to ${role}`,
    );

    return updatedMember;
  }

  async removeMember(
    orgId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.owner_user_id === userId) {
      throw new ForbiddenException(
        'Cannot remove the organization owner. Transfer ownership first.',
      );
    }

    const member = await this.memberRepository.findOne({
      where: {
        organization_id: orgId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    await this.memberRepository.remove(member);

    this.logger.log(
      `Member removed from org ${orgId}: user ${userId}`,
    );

    return { message: 'Member removed successfully' };
  }

  async getBranding(orgId: string): Promise<{
    logo_url?: string;
    colors?: { primary: string; secondary: string };
    fonts?: { heading: string; body: string };
    locked_fields?: string[];
  }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org.branding_settings || {};
  }

  async updateBranding(
    orgId: string,
    dto: UpdateBrandingDto,
  ): Promise<{
    logo_url?: string;
    colors?: { primary: string; secondary: string };
    fonts?: { heading: string; body: string };
    locked_fields?: string[];
  }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const currentBranding = org.branding_settings || {};

    const updatedBranding = {
      ...currentBranding,
      ...(dto.logoUrl !== undefined && { logo_url: dto.logoUrl }),
      ...(dto.colors !== undefined && {
        colors: { ...currentBranding.colors, ...dto.colors },
      }),
      ...(dto.fonts !== undefined && {
        fonts: { ...currentBranding.fonts, ...dto.fonts },
      }),
      ...(dto.lockedFields !== undefined && {
        locked_fields: dto.lockedFields,
      }),
    };

    await this.orgRepository.update(orgId, {
      branding_settings: updatedBranding,
    });

    this.logger.log(`Branding updated for org: ${orgId}`);

    return updatedBranding;
  }

  async getAuditLogs(
    orgId: string,
    filters: {
      page?: number;
      limit?: number;
      action?: AuditAction;
      resourceType?: AuditResourceType;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.organization_id = :orgId', { orgId })
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.action) {
      queryBuilder.andWhere('log.action = :action', {
        action: filters.action,
      });
    }

    if (filters.resourceType) {
      queryBuilder.andWhere('log.resource_type = :resourceType', {
        resourceType: filters.resourceType,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere('log.user_id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('log.timestamp >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('log.timestamp <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    // Strip sensitive user data
    const safeLogs = logs.map((log) => {
      if (log.user) {
        const {
          password_hash,
          password_reset_token,
          password_reset_expires_at,
          email_verification_token,
          passkey_public_key,
          passkey_credential_id,
          ...safeUser
        } = log.user;
        log.user = safeUser as User;
      }
      return log;
    });

    return {
      logs: safeLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async createAuditLog(
    userId: string,
    orgId: string,
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId: string,
    before: Record<string, any> | null,
    after: Record<string, any> | null,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      user_id: userId,
      organization_id: orgId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes: {
        ...(before && { before }),
        ...(after && { after }),
      },
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }
}
