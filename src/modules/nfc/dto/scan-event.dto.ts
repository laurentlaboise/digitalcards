import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanEventDto {
  @ApiProperty({ description: 'Serial number of the scanned NFC device', example: 'NFC-A1B2C3D4' })
  @IsNotEmpty()
  @IsString()
  device_serial: string;

  @ApiPropertyOptional({ description: 'User agent of the scanning device' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional({ description: 'IP address of the scanning device' })
  @IsOptional()
  @IsString()
  ip_address?: string;
}
