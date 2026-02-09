import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThemeSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  colors?: { primary: string; secondary: string; background: string };

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

export class CustomFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Default job title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Theme settings for the template',
    type: ThemeSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme_settings?: ThemeSettingsDto;

  @ApiPropertyOptional({
    description: 'Custom fields for the template',
    type: [CustomFieldDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  custom_fields?: CustomFieldDto[];
}
