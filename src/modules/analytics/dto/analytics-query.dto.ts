import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class AnalyticsQueryDto {
  @ApiProperty({ description: 'Start date for the analytics range', example: '2025-01-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: 'End date for the analytics range', example: '2025-12-31' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({
    enum: AnalyticsInterval,
    description: 'Time interval for aggregation',
    example: AnalyticsInterval.DAILY,
  })
  @IsOptional()
  @IsEnum(AnalyticsInterval)
  interval?: AnalyticsInterval;
}
