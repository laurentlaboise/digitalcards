import {
  IsOptional,
  IsEnum,
  IsArray,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../../../entities';

export class LeadQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: LeadStatus, description: 'Filter by lead status' })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'hot-lead,enterprise',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Full-text search on submission data', example: 'john@example.com' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter start date', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Filter end date', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
