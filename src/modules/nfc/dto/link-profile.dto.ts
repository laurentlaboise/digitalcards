import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkProfileDto {
  @ApiProperty({ description: 'Profile ID to link to the NFC device', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  profile_id: string;
}
