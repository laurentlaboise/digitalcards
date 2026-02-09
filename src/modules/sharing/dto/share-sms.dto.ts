import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareSmsDto {
  @ApiProperty({
    description: 'Phone number of the recipient (E.164 format)',
    example: '+14155551234',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +14155551234)',
  })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Optional personal message to include' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
