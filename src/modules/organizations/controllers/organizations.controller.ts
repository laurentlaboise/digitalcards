import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { UpdateBrandingDto } from '../dto/update-branding.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../../common/pipes/parse-uuid.pipe';
import { User, OrgRole, AuditAction, AuditResourceType } from '../../../entities';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.id, dto);
  }

  @Get(':orgId')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.VIEWER)
  @ApiOperation({ summary: 'Get organization details' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Organization details retrieved' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('orgId', new ParseUUIDPipe('orgId')) orgId: string) {
    return this.organizationsService.findOne(orgId);
  }

  @Put(':orgId')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async update(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(orgId, dto);
  }

  @Delete(':orgId')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async delete(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
  ) {
    return this.organizationsService.delete(orgId);
  }

  @Get(':orgId/members')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.VIEWER)
  @ApiOperation({ summary: 'Get paginated list of organization members' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Member list retrieved' })
  async getMembers(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.organizationsService.getMembers(orgId, { page, limit });
  }

  @Post(':orgId/members/invite')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @ApiOperation({ summary: 'Invite a new member to the organization' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  @ApiResponse({ status: 409, description: 'Member already exists or invited' })
  async inviteMember(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(
      orgId,
      dto.email,
      dto.role || OrgRole.VIEWER,
      user.id,
    );
  }

  @Put(':orgId/members/:userId/role')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @ApiOperation({ summary: 'Update a member role' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Member role updated' })
  @ApiResponse({ status: 403, description: 'Cannot change owner role' })
  async updateMemberRole(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Param('userId', new ParseUUIDPipe('userId')) userId: string,
    @Body() body: { role: OrgRole },
  ) {
    return this.organizationsService.updateMemberRole(orgId, userId, body.role);
  }

  @Delete(':orgId/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Cannot remove owner' })
  async removeMember(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Param('userId', new ParseUUIDPipe('userId')) userId: string,
  ) {
    return this.organizationsService.removeMember(orgId, userId);
  }

  @Get(':orgId/branding')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.VIEWER)
  @ApiOperation({ summary: 'Get organization branding settings' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Branding settings retrieved' })
  async getBranding(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
  ) {
    return this.organizationsService.getBranding(orgId);
  }

  @Put(':orgId/branding')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @ApiOperation({ summary: 'Update organization branding settings' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Branding settings updated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateBranding(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Body() dto: UpdateBrandingDto,
  ) {
    return this.organizationsService.updateBranding(orgId, dto);
  }

  @Get(':orgId/audit-logs')
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated organization audit logs' })
  @ApiParam({ name: 'orgId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'resourceType', required: false, enum: AuditResourceType })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(
    @Param('orgId', new ParseUUIDPipe('orgId')) orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('action') action?: AuditAction,
    @Query('resourceType') resourceType?: AuditResourceType,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.organizationsService.getAuditLogs(orgId, {
      page,
      limit,
      action,
      resourceType,
      userId,
      startDate,
      endDate,
    });
  }
}
