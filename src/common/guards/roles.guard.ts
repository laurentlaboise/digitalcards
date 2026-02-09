import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { OrganizationMember, OrgRole } from '../../entities';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(OrganizationMember)
    private readonly orgMemberRepository: Repository<OrganizationMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const orgId =
      request.params.orgId ||
      request.params.organizationId ||
      request.body?.organizationId;

    if (!orgId) {
      throw new ForbiddenException('Organization context required');
    }

    const membership = await this.orgMemberRepository.findOne({
      where: {
        user_id: user.id,
        organization_id: orgId,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this organization',
      );
    }

    const roleHierarchy: Record<OrgRole, number> = {
      [OrgRole.ADMIN]: 3,
      [OrgRole.EDITOR]: 2,
      [OrgRole.VIEWER]: 1,
    };

    const userRoleLevel = roleHierarchy[membership.role] || 0;
    const hasRole = requiredRoles.some(
      (role) => userRoleLevel >= roleHierarchy[role],
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'Insufficient role permissions for this action',
      );
    }

    request.orgMembership = membership;
    return true;
  }
}
