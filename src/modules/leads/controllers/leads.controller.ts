import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { LeadsService } from '../services/leads.service';
import { CreateLeadFormDto } from '../dto/create-lead-form.dto';
import { UpdateLeadFormDto } from '../dto/update-lead-form.dto';
import { SubmitLeadDto } from '../dto/submit-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { LeadQueryDto } from '../dto/lead-query.dto';

@ApiTags('Leads')
@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('profiles/:id/lead-forms')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a lead capture form for a profile' })
  async createForm(
    @Param('id', ParseUUIDPipe) profileId: string,
    @Body() dto: CreateLeadFormDto,
  ) {
    return this.leadsService.createForm(profileId, dto);
  }

  @Get('profiles/:id/lead-forms')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List lead forms for a profile' })
  async getForms(@Param('id', ParseUUIDPipe) profileId: string) {
    return this.leadsService.getForms(profileId);
  }

  @Put('profiles/:id/lead-forms/:formId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a lead form' })
  async updateForm(
    @Param('formId', ParseUUIDPipe) formId: string,
    @Body() dto: UpdateLeadFormDto,
  ) {
    return this.leadsService.updateForm(formId, dto);
  }

  @Delete('profiles/:id/lead-forms/:formId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a lead form' })
  async deleteForm(@Param('formId', ParseUUIDPipe) formId: string) {
    return this.leadsService.deleteForm(formId);
  }

  @Post('lead-forms/:formId/submit')
  @Public()
  @ApiOperation({ summary: 'Submit a lead form (public endpoint)' })
  async submitForm(
    @Param('formId', ParseUUIDPipe) formId: string,
    @Body() dto: SubmitLeadDto,
    @Req() req: Request,
  ) {
    return this.leadsService.submitForm(formId, dto.submission_data, {
      ip_address: (req.headers['x-forwarded-for'] as string) || req.ip,
      user_agent: req.headers['user-agent'] || '',
    });
  }

  @Get('profiles/:id/leads')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List captured leads for a profile' })
  async getLeads(
    @Param('id', ParseUUIDPipe) profileId: string,
    @Query() query: LeadQueryDto,
  ) {
    return this.leadsService.getLeads(profileId, query);
  }

  @Get('leads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get lead details with enrichment data' })
  async getLead(@Param('id', ParseUUIDPipe) leadId: string) {
    return this.leadsService.getLead(leadId);
  }

  @Put('leads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update lead status, tags, or notes' })
  async updateLead(
    @Param('id', ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.updateLead(leadId, dto);
  }

  @Post('leads/:id/followup')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a follow-up email to a lead' })
  async sendFollowup(
    @Param('id', ParseUUIDPipe) leadId: string,
    @Body('template_id') templateId?: string,
  ) {
    return this.leadsService.sendFollowup(leadId, templateId);
  }

  @Post('profiles/:id/leads/export')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export leads as CSV' })
  async exportLeads(
    @Param('id', ParseUUIDPipe) profileId: string,
    @Query() query: LeadQueryDto,
  ) {
    return this.leadsService.exportLeads(profileId, query, 'csv');
  }

  @Post('profiles/:id/leads/enrich')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trigger lead enrichment' })
  async enrichLead(@Body('lead_id', ParseUUIDPipe) leadId: string) {
    return this.leadsService.enrichLead(leadId);
  }
}
