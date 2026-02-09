import { IsOptional, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

export class UpdateThemeDto {
  @ApiPropertyOptional({ type: ThemeColorsDto, description: 'Theme color palette' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;

  @ApiPropertyOptional({ description: 'Background style or image URL' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({ description: 'Font family name' })
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional({ description: 'Layout style identifier' })
  @IsOptional()
  @IsString()
  layout?: string;
}
