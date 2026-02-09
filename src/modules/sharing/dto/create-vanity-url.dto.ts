import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVanityUrlDto {
  @ApiProperty({
    description: 'Custom vanity slug for the short link (alphanumeric and hyphens only)',
    example: 'john-doe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Slug must contain only alphanumeric characters and hyphens',
  })
  slug: string;
}
