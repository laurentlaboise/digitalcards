import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSeatsDto {
  @ApiProperty({
    description: 'Organization ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @ApiProperty({
    description: 'Number of seats to add',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  count: number;
}
