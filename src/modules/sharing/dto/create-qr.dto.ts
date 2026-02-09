import { IsOptional, IsString, IsUrl, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQrDto {
  @ApiPropertyOptional({ description: 'QR code foreground color (hex)', example: '#000000' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'QR code background color (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({ description: 'URL of a logo to embed in the QR code center' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'QR code shape style', example: 'square' })
  @IsOptional()
  @IsString()
  shape?: string;

  @ApiPropertyOptional({ description: 'QR code image size in pixels', example: 300 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(2000)
  size?: number;
}
