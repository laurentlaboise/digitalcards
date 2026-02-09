import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ProfilesService } from '../services/profiles.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CreateSocialLinkDto } from '../dto/create-social-link.dto';
import { UpdateThemeDto } from '../dto/update-theme.dto';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 403, description: 'Profile quota exceeded' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProfileDto,
  ) {
    return this.profilesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all profiles for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 20, max 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for name, title, company, or email' })
  @ApiQuery({ name: 'orgId', required: false, type: String, description: 'Filter by organization ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Paginated list of profiles' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('orgId') orgId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.profilesService.findAll(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      orgId,
      isActive:
        isActive !== undefined ? String(isActive) === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Profile details' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a profile (deactivate)' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 204, description: 'Profile deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.profilesService.softDelete(id, userId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID to duplicate' })
  @ApiResponse({ status: 201, description: 'Profile duplicated successfully' })
  @ApiResponse({ status: 403, description: 'Profile quota exceeded' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.profilesService.duplicate(id, userId);
  }

  @Put(':id/theme')
  @ApiOperation({ summary: 'Update profile theme settings' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Theme updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateTheme(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.profilesService.updateTheme(id, dto);
  }

  @Post(':id/social-links')
  @ApiOperation({ summary: 'Add a social link to a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 201, description: 'Social link added successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async addSocialLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSocialLinkDto,
  ) {
    return this.profilesService.addSocialLink(id, dto);
  }

  @Put(':id/social-links/:linkId')
  @ApiOperation({ summary: 'Update a social link' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiParam({ name: 'linkId', description: 'Social link UUID' })
  @ApiResponse({ status: 200, description: 'Social link updated successfully' })
  @ApiResponse({ status: 404, description: 'Social link not found' })
  async updateSocialLink(
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @Body() dto: CreateSocialLinkDto,
  ) {
    return this.profilesService.updateSocialLink(linkId, dto);
  }

  @Delete(':id/social-links/:linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a social link' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiParam({ name: 'linkId', description: 'Social link UUID' })
  @ApiResponse({ status: 204, description: 'Social link removed successfully' })
  @ApiResponse({ status: 404, description: 'Social link not found' })
  async removeSocialLink(
    @Param('linkId', ParseUUIDPipe) linkId: string,
  ) {
    return this.profilesService.removeSocialLink(linkId);
  }

  @Put(':id/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder social links for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 204, description: 'Social links reordered successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async reorderLinks(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { orderedIds: string[] },
  ) {
    return this.profilesService.reorderLinks(id, body.orderedIds);
  }

  @Post(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set or update password protection for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 204, description: 'Password set successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async setPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { password: string },
  ) {
    return this.profilesService.setProfilePassword(id, body.password);
  }
}
