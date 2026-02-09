import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Organization name',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2, { message: 'Organization name must be at least 2 characters' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'acme.example.com',
    description: 'Custom domain for the organization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;
}
