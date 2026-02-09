import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Public } from '../../../common/decorators/public.decorator';
import { SharingService } from '../services/sharing.service';
import { VerifyPasswordDto } from '../dto/verify-password.dto';

@ApiTags('Public')
@Public()
@Controller()
export class PublicController {
  constructor(private readonly sharingService: SharingService) {}

  @Get('s/:shortCode')
  @ApiOperation({ summary: 'Resolve a short link and redirect to the profile' })
  @ApiParam({ name: 'shortCode', description: 'Short code or vanity slug' })
  @ApiResponse({ status: 302, description: 'Redirect to the profile page' })
  @ApiResponse({ status: 404, description: 'Short link not found' })
  async resolveShortLink(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { fullUrl } = await this.sharingService.resolveShortLink(shortCode);

    await this.sharingService.trackClick(shortCode, {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      referrer: req.headers['referer'] as string,
    });

    return res.redirect(HttpStatus.FOUND, fullUrl);
  }

  @Get('p/:profileId')
  @ApiOperation({ summary: 'Get public profile data as JSON' })
  @ApiParam({ name: 'profileId', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Public profile data' })
  @ApiResponse({ status: 404, description: 'Profile not found or inactive' })
  async getPublicProfile(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Req() req: Request,
  ) {
    const profile = await this.sharingService.getPublicProfile(profileId);

    await this.sharingService.trackClick(profileId, {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      referrer: req.headers['referer'] as string,
    });

    return profile;
  }

  @Post('p/:profileId/verify-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password for a protected profile' })
  @ApiParam({ name: 'profileId', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Password verified, returns profile data' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async verifyPassword(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() dto: VerifyPasswordDto,
  ) {
    const isValid = await this.sharingService.verifyPassword(
      profileId,
      dto.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.sharingService.getPublicProfile(profileId);
  }
}
