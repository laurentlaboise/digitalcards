import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitLeadDto {
  @ApiProperty({
    description: 'Form submission data as key-value pairs matching form fields',
    example: { name: 'John Doe', email: 'john@example.com', company: 'Acme Inc' },
  })
  @IsObject()
  submission_data: Record<string, any>;
}
