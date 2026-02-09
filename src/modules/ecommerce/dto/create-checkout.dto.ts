import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty({ description: 'Product ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ description: 'Quantity to purchase', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Product customization options' })
  @IsOptional()
  @IsObject()
  customization?: Record<string, any>;
}

export class ShippingAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Array of items to purchase',
    type: [CheckoutItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'Shipping address for physical products',
    type: ShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address?: ShippingAddressDto;
}
