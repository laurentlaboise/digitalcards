import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { IntegrationType } from '../../../entities';

export class ConnectIntegrationDto {
  @IsEnum(IntegrationType)
  integration_type: IntegrationType;

  @IsObject()
  credentials: Record<string, any>;

  @IsOptional()
  @IsString()
  webhook_url?: string;

  @IsOptional()
  @IsUUID()
  organization_id?: string;
}
