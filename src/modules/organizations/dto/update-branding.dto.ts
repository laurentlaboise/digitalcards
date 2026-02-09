import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BrandingColorsDto {
  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  primary?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  secondary?: string;
}

class BrandingFontsDto {
  @ApiPropertyOptional({ example: 'Inter' })
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiPropertyOptional({ example: 'Roboto' })
  @IsOptional()
  @IsString()
  body?: string;
}

export class UpdateBrandingDto {
  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo.png',
    description: 'URL of the organization logo',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    type: BrandingColorsDto,
    description: 'Brand color configuration',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BrandingColorsDto)
  colors?: BrandingColorsDto;

  @ApiPropertyOptional({
    type: BrandingFontsDto,
    description: 'Brand font configuration',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BrandingFontsDto)
  fonts?: BrandingFontsDto;

  @ApiPropertyOptional({
    example: ['company', 'title'],
    description: 'Fields that are locked and cannot be changed by members',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lockedFields?: string[];
}
