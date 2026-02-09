import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  LeadForm,
  LeadSubmission,
  LeadStatus,
  Profile,
  EventType,
} from '../../../entities';
import { CreateLeadFormDto } from '../dto/create-lead-form.dto';
import { UpdateLeadFormDto } from '../dto/update-lead-form.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { LeadQueryDto } from '../dto/lead-query.dto';

export interface PaginatedLeads {
  data: LeadSubmission[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(LeadForm)
    private readonly leadFormRepository: Repository<LeadForm>,
    @InjectRepository(LeadSubmission)
    private readonly leadSubmissionRepository: Repository<LeadSubmission>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectQueue('leads')
    private readonly leadsQueue: Queue,
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) {}

  async createForm(
    profileId: string,
    dto: CreateLeadFormDto,
  ): Promise<LeadForm> {
    await this.ensureProfileExists(profileId);

    const form = this.leadFormRepository.create({
      profile_id: profileId,
      form_name: dto.form_name,
      fields: dto.fields,
      submit_button_text: dto.submit_button_text || 'Submit',
      confirmation_message: dto.confirmation_message || null,
      auto_followup_enabled: dto.auto_followup_enabled || false,
    });

    const saved = await this.leadFormRepository.save(form);
    this.logger.log(`Created lead form ${saved.id} for profile ${profileId}`);
    return saved;
  }

  async getForms(profileId: string): Promise<LeadForm[]> {
    await this.ensureProfileExists(profileId);

    return this.leadFormRepository.find({
      where: { profile_id: profileId },
      order: { created_at: 'DESC' },
    });
  }

  async updateForm(
    formId: string,
    dto: UpdateLeadFormDto,
  ): Promise<LeadForm> {
    const form = await this.leadFormRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Lead form ${formId} not found`);
    }

    if (dto.form_name !== undefined) form.form_name = dto.form_name;
    if (dto.fields !== undefined) form.fields = dto.fields;
    if (dto.submit_button_text !== undefined)
      form.submit_button_text = dto.submit_button_text;
    if (dto.confirmation_message !== undefined)
      form.confirmation_message = dto.confirmation_message;
    if (dto.auto_followup_enabled !== undefined)
      form.auto_followup_enabled = dto.auto_followup_enabled;

    const saved = await this.leadFormRepository.save(form);
    this.logger.log(`Updated lead form ${formId}`);
    return saved;
  }

  async deleteForm(formId: string): Promise<void> {
    const form = await this.leadFormRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Lead form ${formId} not found`);
    }

    await this.leadFormRepository.remove(form);
    this.logger.log(`Deleted lead form ${formId}`);
  }

  async submitForm(
    formId: string,
    submissionData: Record<string, any>,
    metadata: { ip_address?: string; user_agent?: string },
  ): Promise<{ submission_id: string; confirmation_message: string }> {
    const form = await this.leadFormRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Lead form ${formId} not found`);
    }

    this.validateSubmission(form, submissionData);

    const submission = this.leadSubmissionRepository.create({
      lead_form_id: formId,
      profile_id: form.profile_id,
      submission_data: submissionData,
      source_ip: metadata.ip_address || null,
      user_agent: metadata.user_agent || null,
      submitted_at: new Date(),
      status: LeadStatus.NEW,
      tags: [],
    });

    const saved = await this.leadSubmissionRepository.save(submission);

    await this.analyticsQueue.add('ingest-event', {
      profile_id: form.profile_id,
      event_type: EventType.LEAD_CAPTURE,
      event_metadata: {
        lead_form_id: formId,
        lead_submission_id: saved.id,
      },
      ip_address: metadata.ip_address || null,
      user_agent: metadata.user_agent || null,
      timestamp: new Date().toISOString(),
    });

    if (form.auto_followup_enabled && form.followup_template_id) {
      await this.leadsQueue.add('auto-followup', {
        submission_id: saved.id,
        template_id: form.followup_template_id,
        submission_data: submissionData,
      });
    }

    this.logger.log(
      `Lead submission ${saved.id} created for form ${formId}`,
    );

    return {
      submission_id: saved.id,
      confirmation_message:
        form.confirmation_message || 'Thank you for your submission!',
    };
  }

  async getLeads(
    profileId: string,
    filters: LeadQueryDto,
  ): Promise<PaginatedLeads> {
    await this.ensureProfileExists(profileId);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const qb: SelectQueryBuilder<LeadSubmission> = this.leadSubmissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.lead_form', 'lead_form')
      .where('submission.profile_id = :profileId', { profileId });

    if (filters.status) {
      qb.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters.tags) {
      const tagArray = filters.tags.split(',').map((t) => t.trim());
      qb.andWhere('submission.tags && :tags', { tags: tagArray });
    }

    if (filters.search) {
      qb.andWhere(
        "CAST(submission.submission_data AS TEXT) ILIKE :search",
        { search: `%${filters.search}%` },
      );
    }

    if (filters.start_date) {
      qb.andWhere('submission.submitted_at >= :startDate', {
        startDate: filters.start_date,
      });
    }

    if (filters.end_date) {
      qb.andWhere('submission.submitted_at <= :endDate', {
        endDate: filters.end_date,
      });
    }

    qb.orderBy('submission.submitted_at', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getLead(leadId: string): Promise<LeadSubmission> {
    const lead = await this.leadSubmissionRepository.findOne({
      where: { id: leadId },
      relations: ['lead_form'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    return lead;
  }

  async updateLead(
    leadId: string,
    dto: UpdateLeadDto,
  ): Promise<LeadSubmission> {
    const lead = await this.leadSubmissionRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    if (dto.status !== undefined) lead.status = dto.status;
    if (dto.tags !== undefined) lead.tags = dto.tags;
    if (dto.notes !== undefined) lead.notes = dto.notes;

    const saved = await this.leadSubmissionRepository.save(lead);
    this.logger.log(`Updated lead ${leadId}`);
    return saved;
  }

  async sendFollowup(
    leadId: string,
    templateId: string,
  ): Promise<{ queued: boolean }> {
    const lead = await this.leadSubmissionRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    await this.leadsQueue.add('send-followup', {
      submission_id: leadId,
      template_id: templateId,
      submission_data: lead.submission_data,
    });

    this.logger.log(
      `Queued follow-up email for lead ${leadId} with template ${templateId}`,
    );

    return { queued: true };
  }

  async exportLeads(
    profileId: string,
    filters: LeadQueryDto,
    format: 'csv' = 'csv',
  ): Promise<{ job_id: string }> {
    await this.ensureProfileExists(profileId);

    const job = await this.leadsQueue.add('export-leads', {
      profile_id: profileId,
      filters,
      format,
    });

    this.logger.log(
      `Queued leads export job ${job.id} for profile ${profileId}`,
    );

    return { job_id: job.id as string };
  }

  async enrichLead(leadId: string): Promise<{ queued: boolean }> {
    const lead = await this.leadSubmissionRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    await this.leadsQueue.add('enrich-lead', {
      submission_id: leadId,
      submission_data: lead.submission_data,
    });

    this.logger.log(`Queued enrichment job for lead ${leadId}`);

    return { queued: true };
  }

  private validateSubmission(
    form: LeadForm,
    submissionData: Record<string, any>,
  ): void {
    const errors: string[] = [];

    for (const field of form.fields) {
      if (field.required && !submissionData[field.name]) {
        errors.push(`Field "${field.label}" is required`);
      }

      if (submissionData[field.name] !== undefined && submissionData[field.name] !== null) {
        const value = submissionData[field.name];

        if (field.type === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`Field "${field.label}" must be a valid email address`);
          }
        }

        if (
          field.type === 'select' &&
          field.options &&
          !field.options.includes(value)
        ) {
          errors.push(
            `Field "${field.label}" must be one of: ${field.options.join(', ')}`,
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Form validation failed',
        errors,
      });
    }
  }

  private async ensureProfileExists(profileId: string): Promise<void> {
    const exists = await this.profileRepository.findOne({
      where: { id: profileId },
      select: ['id'],
    });
    if (!exists) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }
  }
}
