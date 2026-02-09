import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address associated with the account',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'N3wP@ssw0rd!',
    description:
      'New password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
  })
  @IsString()
  token: string;
}
