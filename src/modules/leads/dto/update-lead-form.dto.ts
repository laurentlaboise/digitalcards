import { PartialType } from '@nestjs/swagger';
import { CreateLeadFormDto } from './create-lead-form.dto';

export class UpdateLeadFormDto extends PartialType(CreateLeadFormDto) {}
