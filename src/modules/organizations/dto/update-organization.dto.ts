import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    example: 'Acme Corp Updated',
    description: 'Organization name',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Organization name must be at least 2 characters' })
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'acme.example.com',
    description: 'Custom domain for the organization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;
}
