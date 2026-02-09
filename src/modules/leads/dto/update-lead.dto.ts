import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../../../entities';

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus, description: 'Lead status', example: LeadStatus.CONTACTED })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the lead',
    example: ['hot-lead', 'enterprise'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Internal notes about the lead', example: 'Discussed pricing on call' })
  @IsOptional()
  @IsString()
  notes?: string;
}
