import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordDto {
  @ApiProperty({ description: 'Password to verify access to a protected profile' })
  @IsString()
  @MinLength(1)
  password: string;
}
