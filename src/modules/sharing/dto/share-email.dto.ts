import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareEmailDto {
  @ApiProperty({ description: 'Email address of the recipient' })
  @IsEmail()
  recipientEmail: string;

  @ApiPropertyOptional({ description: 'Optional personal message to include' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
