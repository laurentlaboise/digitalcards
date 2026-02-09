import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { OrgRole } from '../../../entities';

export class InviteMemberDto {
  @ApiProperty({
    example: 'newmember@example.com',
    description: 'Email address of the person to invite',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    enum: OrgRole,
    default: OrgRole.VIEWER,
    description: 'Role to assign to the new member',
  })
  @IsOptional()
  @IsEnum(OrgRole, {
    message: `Role must be one of: ${Object.values(OrgRole).join(', ')}`,
  })
  role?: OrgRole;
}
