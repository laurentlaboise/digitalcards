import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType, DeviceMaterial } from '../../../entities';

export class ProvisionDeviceDto {
  @ApiProperty({ enum: DeviceType, example: DeviceType.CARD })
  @IsEnum(DeviceType)
  device_type: DeviceType;

  @ApiProperty({ enum: DeviceMaterial, example: DeviceMaterial.PLASTIC })
  @IsEnum(DeviceMaterial)
  material: DeviceMaterial;

  @ApiPropertyOptional({ description: 'Associated order ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  order_id?: string;
}
