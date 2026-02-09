import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadFormFieldDto {
  @ApiProperty({ description: 'Field name (used as key)', example: 'email' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Field type (text, email, phone, select, checkbox, textarea)', example: 'email' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Whether the field is required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ description: 'Display label for the field', example: 'Email Address' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'Placeholder text', example: 'Enter your email' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Options for select/checkbox fields',
    example: ['Option A', 'Option B'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Conditional logic for showing/hiding this field',
  })
  @IsOptional()
  conditional_logic?: {
    depends_on: string;
    condition: string;
    value: string;
  };
}

export class CreateLeadFormDto {
  @ApiProperty({ description: 'Name of the lead form', example: 'Contact Form' })
  @IsString()
  @IsNotEmpty()
  form_name: string;

  @ApiProperty({
    description: 'Array of form field definitions',
    type: [LeadFormFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadFormFieldDto)
  fields: LeadFormFieldDto[];

  @ApiPropertyOptional({ description: 'Submit button text', example: 'Send Message', default: 'Submit' })
  @IsOptional()
  @IsString()
  submit_button_text?: string;

  @ApiPropertyOptional({ description: 'Confirmation message after submission', example: 'Thank you for reaching out!' })
  @IsOptional()
  @IsString()
  confirmation_message?: string;

  @ApiPropertyOptional({ description: 'Whether to send auto follow-up email', default: false })
  @IsOptional()
  @IsBoolean()
  auto_followup_enabled?: boolean;
}
