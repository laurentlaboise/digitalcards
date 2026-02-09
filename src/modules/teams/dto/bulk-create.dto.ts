import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkProfileItemDto {
  @ApiProperty({ description: 'Full name of the team member' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class BulkCreateDto {
  @ApiProperty({
    description: 'Array of profiles to create',
    type: [BulkProfileItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProfileItemDto)
  profiles: BulkProfileItemDto[];
}
