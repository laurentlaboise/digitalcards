import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TeamsService } from '../services/teams.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { BulkCreateDto } from '../dto/bulk-create.dto';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get(':orgId/directory')
  @ApiOperation({ summary: 'Get searchable team directory' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDirectory(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.teamsService.getDirectory(
      orgId,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(':orgId/templates')
  @ApiOperation({ summary: 'Create a shared profile template' })
  async createTemplate(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.teamsService.createTemplate(orgId, dto);
  }

  @Get(':orgId/templates')
  @ApiOperation({ summary: 'List organization templates' })
  async getTemplates(@Param('orgId', ParseUUIDPipe) orgId: string) {
    return this.teamsService.getTemplates(orgId);
  }

  @Put(':orgId/templates/:id')
  @ApiOperation({ summary: 'Update a template' })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.teamsService.updateTemplate(id, dto);
  }

  @Post(':orgId/bulk-create')
  @ApiOperation({ summary: 'Bulk create profiles for team members' })
  async bulkCreateProfiles(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() dto: BulkCreateDto,
  ) {
    return this.teamsService.bulkCreateProfiles(orgId, dto.profiles);
  }

  @Get(':orgId/usage')
  @ApiOperation({ summary: 'Get team usage statistics' })
  async getUsage(@Param('orgId', ParseUUIDPipe) orgId: string) {
    return this.teamsService.getUsage(orgId);
  }

  @Post(':orgId/export')
  @ApiOperation({ summary: 'Export all team data' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['csv', 'json', 'xlsx'],
  })
  async exportTeamData(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('format') format: string = 'csv',
  ) {
    return this.teamsService.exportTeamData(orgId, format);
  }
}
