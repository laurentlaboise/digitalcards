import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SharingService } from '../services/sharing.service';
import { CreateQrDto } from '../dto/create-qr.dto';
import { CreateVanityUrlDto } from '../dto/create-vanity-url.dto';
import { ShareEmailDto } from '../dto/share-email.dto';
import { ShareSmsDto } from '../dto/share-sms.dto';

@ApiTags('Sharing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Get(':id/qr')
  @ApiOperation({ summary: 'Generate a default QR code for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getQrCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.sharingService.generateQRCode(id);
  }

  @Post(':id/qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a custom-styled QR code for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Custom QR code generated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async createCustomQrCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQrDto,
  ) {
    return this.sharingService.generateQRCode(id, dto);
  }

  @Get(':id/short-link')
  @ApiOperation({ summary: 'Get or create a short link for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Short link retrieved' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getShortLink(@Param('id', ParseUUIDPipe) id: string) {
    return this.sharingService.getShortLink(id);
  }

  @Post(':id/short-link')
  @ApiOperation({ summary: 'Create a vanity short link for a profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 201, description: 'Vanity URL created successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Vanity slug already taken' })
  async createVanityUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVanityUrlDto,
  ) {
    return this.sharingService.createVanityUrl(id, dto.slug);
  }

  @Post(':id/share/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Share a profile via email' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'Email share queued successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async shareViaEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShareEmailDto,
  ) {
    return this.sharingService.shareViaEmail(
      id,
      dto.recipientEmail,
      dto.message,
    );
  }

  @Post(':id/share/sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Share a profile via SMS' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @ApiResponse({ status: 200, description: 'SMS share queued successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async shareViaSms(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShareSmsDto,
  ) {
    return this.sharingService.shareViaSms(
      id,
      dto.phoneNumber,
      dto.message,
    );
  }
}
