import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsUUID,
  IsObject,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomFieldDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

class ThemeColorsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  background?: string;
}

class ThemeSettingsDto {
  @ApiPropertyOptional({ type: ThemeColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  layout?: string;
}

export class CreateProfileDto {
  @ApiProperty({ description: 'Display name for the profile' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Company or organization name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Contact email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Short biography or description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Theme customization settings', type: ThemeSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme_settings?: ThemeSettingsDto;

  @ApiPropertyOptional({
    description: 'Custom fields for additional information',
    type: [CustomFieldDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  custom_fields?: CustomFieldDto[];

  @ApiPropertyOptional({ description: 'Organization ID to associate the profile with' })
  @IsOptional()
  @IsUUID()
  organization_id?: string;
}
