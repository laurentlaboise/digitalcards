import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received from login or previous token refresh',
  })
  @IsString()
  refreshToken: string;
}
