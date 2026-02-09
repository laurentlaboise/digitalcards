import {
  IsEnum,
  IsUrl,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialPlatform } from '../../../entities';

export class CreateSocialLinkDto {
  @ApiProperty({
    enum: SocialPlatform,
    description: 'Social media platform',
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty({ description: 'URL of the social profile or link' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Custom label for the link' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Display order position (0-based)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}
