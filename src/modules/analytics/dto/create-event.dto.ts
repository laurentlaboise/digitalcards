import {
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../entities';

export class CreateEventDto {
  @ApiProperty({ description: 'Profile ID the event belongs to', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  profile_id: string;

  @ApiProperty({ enum: EventType, example: EventType.VIEW })
  @IsEnum(EventType)
  event_type: EventType;

  @ApiPropertyOptional({
    description: 'Additional event metadata',
    example: { referrer: 'https://google.com', device: 'mobile', os: 'iOS' },
  })
  @IsOptional()
  @IsObject()
  event_metadata?: {
    link_clicked?: string;
    device?: string;
    os?: string;
    browser?: string;
    referrer?: string;
    nfc_serial?: string;
  };

  @ApiPropertyOptional({ description: 'Client IP address' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'Client user agent string' })
  @IsOptional()
  @IsString()
  user_agent?: string;
}
